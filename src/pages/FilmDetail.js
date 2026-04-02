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

    // Payment state
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
            setError('Could not load seats.');
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
            return setError('Please select at least one seat.');
        }

        setCreatingIntent(true);
        setError('');

        try {
            const response = await createPaymentIntent({
                screening_id: parseInt(id),
                seat_ids: selectedSeats.map(s => s.id),
            });

            // Load Stripe with the publishable key from backend
            const stripe = await loadStripe(response.data.publishableKey);
            setStripePromise(Promise.resolve(stripe));
            setClientSecret(response.data.clientSecret);
            setTotalPrice(response.data.total_price);
            setShowPayment(true);

        } catch (err) {
            setError(err.response?.data?.message || 'Could not initiate payment.');
        } finally {
            setCreatingIntent(false);
        }
    };

    const handlePaymentSuccess = (data) => {
        setSuccess(`Payment successful! ${selectedSeats.length} seat(s) reserved.`);
        setShowPayment(false);
        setSelectedSeats([]);
        fetchSeats();
    };

    const handlePaymentCancel = () => {
        setShowPayment(false);
        setClientSecret('');
    };

    // Group seats by row
    const rows = {};
    seats.forEach(seat => {
        if (!rows[seat.row_label]) rows[seat.row_label] = [];
        rows[seat.row_label].push(seat);
    });

    const currentTotal = screening
        ? (selectedSeats.length * screening.price).toFixed(2)
        : '0.00';

    if (loading) return <div style={styles.center}>Loading seats...</div>;

    return (
        <div style={styles.wrapper}>
            {/* Film Header */}
<div style={styles.header}>
    <button
        onClick={() => navigate('/')}
        className="btn btn-secondary"
        style={{ marginBottom: '20px' }}
    >
        ← Back
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
            </p>
            {film?.synopsis && (
                <p style={styles.synopsis}>{film.synopsis}</p>
            )}
            {screening && (
                <div style={styles.screeningBadge}>
                    <span>📅 {new Date(screening.start_time)
                        .toLocaleDateString('en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                    <span> at {new Date(screening.start_time)
                        .toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                    <span> · 🏛️ {screening.room_name}</span>
                    <span> · 🎟️ €{screening.price} per seat</span>
                </div>
            )}
        </div>
    </div>
</div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {/* Hide seat map when payment form is shown */}
            {!showPayment && (
                <>
                    {/* Legend */}
                    <div style={styles.legend}>
                        <span style={styles.legendItem}>
                            <span style={{...styles.legendDot,
                                background: '#333'}}/> Available
                        </span>
                        <span style={styles.legendItem}>
                            <span style={{...styles.legendDot,
                                background: '#e50914'}}/> Selected
                        </span>
                        <span style={styles.legendItem}>
                            <span style={{...styles.legendDot,
                                background: '#555', opacity: 0.4}}/> Taken
                        </span>
                    </div>

                    {/* Screen */}
                    <div style={styles.screen}>SCREEN</div>

                    {/* Seat Map */}
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

                    {/* Booking Summary */}
                    <div className="card" style={styles.summary}>
                        <h3 style={{ marginBottom: '12px' }}>Booking Summary</h3>
                        {selectedSeats.length === 0 ? (
                            <p style={{ color: '#aaa' }}>
                                No seats selected yet.
                            </p>
                        ) : (
                            <>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong>Selected seats: </strong>
                                    {selectedSeats
                                        .map(s => `${s.row_label}${s.seat_number}`)
                                        .join(', ')
                                    }
                                </p>
                                <p style={{ marginBottom: '16px' }}>
                                    <strong>Total: </strong>
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
                                        ? 'Preparing payment...'
                                        : `Proceed to Payment — €${currentTotal}`
                                    }
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Payment Form */}
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

};

export default FilmDetail;