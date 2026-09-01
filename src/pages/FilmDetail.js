import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getScreeningSeats, createPaymentIntent, cancelPaymentIntent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentForm from '../components/PaymentForm';

const optimizeImg = (url, width) => {
    if (!url) return url;
    return url.replace('/original/', `/w${width}/`);
};

// Shranjevanje zadržane rezervacije med plačilom, da plačilni obrazec preživi
// osvežitev strani. Stanje komponente se ob osvežitvi izgubi, rezervacija na
// zaledju pa ostane "pending" do izteka — brez tega uporabnik obrazca ne bi
// več videl, čeprav je zadržanje sedežev še vedno veljavno.
const HOLD_KEY = 'kinoplex_payment_hold';

const loadPaymentHold = (screeningId) => {
    try {
        const raw = sessionStorage.getItem(HOLD_KEY);
        if (!raw) return null;
        const hold = JSON.parse(raw);
        if (String(hold.screeningId) !== String(screeningId)) return null;
        if (!hold.expiresAt || new Date(hold.expiresAt).getTime() <= Date.now()) {
            sessionStorage.removeItem(HOLD_KEY);
            return null;
        }
        return hold;
    } catch (_err) {
        return null;
    }
};

const savePaymentHold = (hold) => {
    try {
        sessionStorage.setItem(HOLD_KEY, JSON.stringify(hold));
    } catch (_err) {
        // sessionStorage ni na voljo (npr. zaseben način brskanja) — obnovitev
        // po osvežitvi preprosto ne bo delovala, na samo plačilo to ne vpliva
    }
};

const clearPaymentHold = () => {
    try {
        sessionStorage.removeItem(HOLD_KEY);
    } catch (_err) {
        // ni česa počistiti
    }
};

function FilmDetail() {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Stanje plačila
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [expiresAt, setExpiresAt] = useState(null);
    const [reservationId, setReservationId] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [creatingIntent, setCreatingIntent] = useState(false);

    const film = state?.film;
    const screening = state?.screening || film?.screenings?.[0];

    const fetchSeats = useCallback(async () => {
        try {
            const response = await getScreeningSeats(id);
            setSeats(response.data);
        } catch (_err) {
            setError('Napaka pri nalaganju sedežev.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSeats();
    }, [fetchSeats]);

    // Če je bila rezervacija zadržana (klik na "Nadaljuj na plačilo"), stran pa je
    // bila medtem osvežena, tukaj poskusimo plačilni obrazec obnoviti iz
    // sessionStorage namesto da uporabnika pustimo brez obrazca do izteka
    // desetih minut zadržanja.
    useEffect(() => {
        const hold = loadPaymentHold(id);
        if (!hold) return;

        let preklicano = false;

        (async () => {
            try {
                const stripe = await loadStripe(hold.publishableKey);
                if (preklicano) return;
                setStripePromise(Promise.resolve(stripe));
                setClientSecret(hold.clientSecret);
                setTotalPrice(hold.totalPrice);
                setExpiresAt(hold.expiresAt);
                setReservationId(hold.reservationId);
                setSelectedSeats(hold.seats || []);
                setShowPayment(true);
            } catch (_err) {
                clearPaymentHold();
            }
        })();

        return () => { preklicano = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const toggleSeat = (seat) => {
        if (seat.status === 'taken') return;
        setSelectedSeats(prev => {
            const isSelected = prev.find(s => s.id === seat.id);
            if (isSelected) return prev.filter(s => s.id !== seat.id);
            return [...prev, seat];
        });
    };

    const handleProceedToPayment = async () => {
        if (!user) return navigate('/login');
        if (selectedSeats.length === 0) {
            return setError('Prosimo, izberite vsaj en sedež.');
        }

        setCreatingIntent(true);
        setError('');

        try {
            const response = await createPaymentIntent({
                screening_id: parseInt(id),
                seat_ids: selectedSeats.map(s => s.id),
            });

            // Naložite Stripe z objavljivim ključem iz backenda
            const stripe = await loadStripe(response.data.publishableKey);
            setStripePromise(Promise.resolve(stripe));
            setClientSecret(response.data.clientSecret);
            setTotalPrice(response.data.total_price);
            setExpiresAt(response.data.expires_at);
            setReservationId(response.data.reservation_id);
            setShowPayment(true);

            savePaymentHold({
                screeningId: id,
                reservationId: response.data.reservation_id,
                clientSecret: response.data.clientSecret,
                totalPrice: response.data.total_price,
                expiresAt: response.data.expires_at,
                publishableKey: response.data.publishableKey,
                seats: selectedSeats.map(s => ({
                    id: s.id, row_label: s.row_label, seat_number: s.seat_number,
                })),
            });

        } catch (err) {
            setError(err.response?.data?.message || 'Napaka pri pripravi plačila.');
        } finally {
            setCreatingIntent(false);
        }
    };

    const handlePaymentSuccess = (data) => {
        clearPaymentHold();
        setSuccess(`Plačilo uspešno! ${selectedSeats.length} sedež/ev rezerviranih.`);
        setShowPayment(false);
        setSelectedSeats([]);
        setExpiresAt(null);
        setReservationId(null);
        fetchSeats();
    };

    const handlePaymentCancel = async () => {
        // Sprosti zadržane sedeže, da niso blokirani do izteka desetih minut
        if (reservationId) {
            try {
                await cancelPaymentIntent({ reservation_id: reservationId });
            } catch (_err) {
                // Če sprostitev ne uspe, zadržanje poteče samo od sebe
            }
        }
        clearPaymentHold();
        setShowPayment(false);
        setClientSecret('');
        setExpiresAt(null);
        setReservationId(null);
        fetchSeats();
    };

    const handlePaymentExpire = useCallback(() => {
        clearPaymentHold();
        setShowPayment(false);
        setClientSecret('');
        setExpiresAt(null);
        setReservationId(null);
        setSelectedSeats([]);
        setError('Čas za dokončanje plačila je potekel. Sedeži so bili sproščeni.');
        fetchSeats();
    }, [fetchSeats]);

    // grupiraj sedeže po vrstah
    const rows = {};
    seats.forEach(seat => {
        if (!rows[seat.row_label]) rows[seat.row_label] = [];
        rows[seat.row_label].push(seat);
    });

    const currentTotal = screening
        ? (selectedSeats.length * screening.price).toFixed(2)
        : '0.00';

    if (loading) return <div style={styles.center}>Nalaganje sedežev...</div>;

    return (
        <div style={styles.wrapper}>
            {/* glava filma */}
<div style={styles.header}>
    <button
        onClick={() => navigate('/')}
        className="btn btn-secondary"
        style={{ marginBottom: '20px' }}
    >
        ← Nazaj
    </button>

    <div style={styles.filmHeaderRow}>
        {/* Poster */}
        {film?.poster_url && (
            <img
    src={optimizeImg(film.poster_url, 342)}
    alt={film.title_sl || film.title}
    style={styles.posterImg}
    width={130}
    height={195}
    loading="lazy"
/>
        )}

        {/* Info */}
        <div style={styles.filmHeaderInfo}>
            <div style={{ marginBottom: '10px' }}>
                <span className="genre-tag">{film?.genre}</span>
                <span className="genre-tag" style={styles.ratingTag}>
                    {film?.age_rating}
                </span>
            </div>
            <h1 style={styles.title}>
    {film?.title_sl || film?.title}
</h1>
{film?.title_sl && film?.title_sl !== film?.title && (
    <p style={styles.originalTitle}>
        {film?.title}
    </p>
)}

            <p style={styles.meta}>
                {film?.duration_minutes} min
                {film?.release_year && ` · ${film.release_year}`}
            </p>
            {/* Režiser */}
    {film?.director && (
        <p style={styles.director}>
            <span style={styles.metaLabel}>Režiser: </span>
            {film.director}
        </p>
    )}

    {/* Zasedba */}
    {film?.cast_members && (
        <p style={styles.castText}>
            <span style={styles.metaLabel}>Zasedba: </span>
            {film.cast_members}
        </p>
    )}

    {/* Povzetek */}
            {film?.synopsis && (
                <p style={styles.synopsis}>{film.synopsis}</p>
            )}
            {/* IMDB in Trailer gumbi */}
                        <div style={styles.linksRow}>
                            {film?.imdb_url && (
                                <a
                                    href={film.imdb_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.imdbBtn}
                                >
                                    IMDb
                                </a>
                            )}
                            {film?.trailer_url && (
                                <a
                                    href={film.trailer_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.trailerBtn}
                                >
                                    Oglej si napovednik
                                </a>
                            )}
                        </div>

    {/* Čas predvajanja */}
            {screening && (
                <div style={styles.screeningBadge}>
                    <span>📅 {new Date(screening.start_time)
                        .toLocaleDateString('sl-SI', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'UTC',
                        })}
                    </span>
                    <span> ob {new Date(screening.start_time)
                        .toLocaleTimeString('sl-SI', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'UTC',
                        })}
                    </span>
                    <span> · 🏛️ {screening.room_name}</span>
                    <span> · 🎟️ €{screening.price} na sedež</span>
                </div>
            )}
        </div>
    </div>
</div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {/* skrij zemljevid sedeže ko se prikaže plačilni obrazec */}
            {!showPayment && (
                <>
                    {/* Legenda */}
                    <div style={styles.legend}>
                        <span style={styles.legendItem}>
                            <span style={{...styles.legendDot,
                                background: '#333'}}/> Prosto
                        </span>
                        <span style={styles.legendItem}>
                            <span style={{...styles.legendDot,
                                background: '#e50914'}}/> Izbrano
                        </span>
                        <span style={styles.legendItem}>
                            <span style={{...styles.legendDot,
                                background: '#00c9b1', opacity: 0.6}}/> Zasedeno
                        </span>
                    </div>

                                 

                    {/* Zemljevid sedežev */}
                    <div style={styles.seatMap}>
                        {/* Zaslon znotraj zemljevida */}
    <div style={styles.screen}>ZASLON</div>
                        {Object.entries(rows).map(([rowLabel, rowSeats]) => (
                            <div key={rowLabel} style={styles.row}>
                                <span style={styles.rowLabel}>{rowLabel}</span>
                                {rowSeats.map(seat => {
                                    const isSelected = selectedSeats
                                        .find(s => s.id === seat.id);
                                    const isTaken = seat.status === 'taken';
                                    return (
                                        <div
                                            key={seat.id}
                                            onClick={() => toggleSeat(seat)}
                                            style={{
                                                ...styles.seat,
                                                background: isTaken
                                                    ? '#00c9b1'
                                                    : isSelected
                                                    ? '#e50914'
                                                    : '#333',
                                                opacity: isTaken ? 0.4 : 1,
                                                cursor: isTaken
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                            }}
                                            title={`Row ${rowLabel},
                                                Seat ${seat.seat_number}`}
                                        >
                                            {seat.seat_number}
                                        </div>
                                    );
                                })}
                                <span style={styles.rowLabel}>{rowLabel}</span>
                            </div>
                        ))}
                    </div>

                    {/* Povzetek rezervacije */}
                    <div className="card" style={styles.summary}>
                        <h3 style={{ marginBottom: '12px' }}>Povzetek rezervacije</h3>
                        {selectedSeats.length === 0 ? (
                            <p style={{ color: '#aaa' }}>
                                Ni izbranih sedežev.
                            </p>
                        ) : (
                            <>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong>Izbrani sedeži: </strong>
                                    {selectedSeats
                                        .map(s => `${s.row_label}${s.seat_number}`)
                                        .join(', ')
                                    }
                                </p>
                                <p style={{ marginBottom: '16px' }}>
                                    <strong>Skupaj: </strong>
                                    <span style={{ color: '#e50914',
                                        fontSize: '20px' }}>
                                        €{currentTotal}
                                    </span>
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleProceedToPayment}
                                    disabled={creatingIntent}
                                    style={{ width: '100%' }}
                                >
                                    {creatingIntent
                                        ? 'Priprava plačila...'
                                        : `Nadaljuj na plačilo — €${currentTotal}`
                                    }
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Plačilni obrazec */}
            {showPayment && clientSecret && stripePromise && (
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        appearance: {
                            theme: 'night',
                            variables: { colorPrimary: '#e50914' }
                        }
                    }}
                >
                    <PaymentForm
                        screeningId={parseInt(id)}
                        seatIds={selectedSeats.map(s => s.id)}
                        totalPrice={totalPrice.toFixed(2)}
                        expiresAt={expiresAt}
                        onSuccess={handlePaymentSuccess}
                        onCancel={handlePaymentCancel}
                        onExpire={handlePaymentExpire}
                    />
                </Elements>
            )}
        </div>
    );
}

const styles = {
    wrapper: { maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', marginBottom: '8px' },
    meta: { color: '#aaa', marginBottom: '8px' },
    screeningInfo: { color: '#ccc', fontSize: '15px' },
    legend: {
        display: 'flex', gap: '24px',
        justifyContent: 'center', marginBottom: '16px',
    },
    legendItem: {
        display: 'flex', alignItems: 'center',
        gap: '8px', fontSize: '14px', color: '#aaa',
    },
    legendDot: {
        width: '16px', height: '16px',
        borderRadius: '4px', display: 'inline-block',
    },
    screen: {
    background: 'linear-gradient(135deg, rgba(0,201,177,0.15), rgba(123,97,255,0.15))',
    border: '1px solid rgba(0,201,177,0.4)',
    color: '#00c9b1',
    textAlign: 'center',
    padding: '10px 40px',
    borderRadius: '6px',
    marginBottom: '24px',
    fontSize: '12px',
    letterSpacing: '6px',
    fontWeight: '700',
    boxShadow: '0 0 20px rgba(0,201,177,0.15)',
    alignSelf: 'center',
},
    seatMap: {
        display: 'flex', flexDirection: 'column',
        gap: '8px', alignItems: 'center', marginBottom: '30px',
    },
    row: { display: 'flex', gap: '6px', alignItems: 'center' },
    rowLabel: {
        width: '20px', textAlign: 'center',
        color: '#aaa', fontSize: '13px',
    },
    seat: {
        width: '36px', height: '36px', borderRadius: '6px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '12px',
        fontWeight: 'bold', userSelect: 'none',
    },
    originalTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '14px',
    fontStyle: 'italic',
    marginBottom: '8px',
    marginTop: '-4px',
},
    summary: { marginTop: '10px' },
    center: { textAlign: 'center', padding: '60px', color: '#aaa' },
    filmHeaderRow: {
    display: 'flex',
    gap: '28px',
    alignItems: 'flex-start',
    marginBottom: '32px',
},
filmPoster: {
    width: '160px',
    height: '240px',
    objectFit: 'cover',
    borderRadius: '12px',
    flexShrink: 0,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
},
filmHeaderInfo: { flex: 1 },
ratingTag: {
    background: 'rgba(123,97,255,0.15)',
    color: '#7b61ff',
    border: '1px solid rgba(123,97,255,0.3)',
},
synopsis: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '14px',
    lineHeight: 1.7,
    marginBottom: '16px',
    maxWidth: '600px',
},
screeningBadge: {
    background: 'rgba(0,201,177,0.08)',
    border: '1px solid rgba(0,201,177,0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ccc',
    fontSize: '14px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
},
director: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    marginBottom: '6px',
},
castText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    marginBottom: '12px',
},
metaLabel: {
    color: '#00c9b1',
    fontWeight: '600',
},
linksRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
},
imdbBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f5c518',
    color: '#000',
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '700',
},
trailerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#ff0000',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '700',
},
};

export default FilmDetail;