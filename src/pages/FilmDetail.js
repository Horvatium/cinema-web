import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getScreeningSeats, createPaymentIntent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentForm from '../components/PaymentForm';

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
            setShowPayment(true);

        } catch (err) {
            setError(err.response?.data?.message || 'Napaka pri pripravi plačila.');
        } finally {
            setCreatingIntent(false);
        }
    };

    const handlePaymentSuccess = (data) => {
        setSuccess(`Plačilo uspešno! ${selectedSeats.length} sedež/ev rezerviranih.`);
        setShowPayment(false);
        setSelectedSeats([]);
        fetchSeats();
    };

    const handlePaymentCancel = () => {
        setShowPayment(false);
        setClientSecret('');
    };

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
                src={film.poster_url}
                alt={film.title}
                style={styles.filmPoster}
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
            <h1 style={styles.title}>{film?.title}</h1>
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
                                    IMDB
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
                        })}
                    </span>
                    <span> ob {new Date(screening.start_time)
                        .toLocaleTimeString('sl-SI', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
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
                                background: '#555', opacity: 0.4}}/> Zasedeno
                        </span>
                    </div>

                    {/* predstava */}
                    <div style={styles.screen}>ZASLON</div>

                    {/* mapa sedežev */}
                    <div style={styles.seatMap}>
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
                                                    ? '#444'
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
                        onSuccess={handlePaymentSuccess}
                        onCancel={handlePaymentCancel}
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
        background: '#333', color: '#aaa', textAlign: 'center',
        padding: '8px', borderRadius: '4px',
        marginBottom: '24px', fontSize: '12px', letterSpacing: '4px',
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