import { useState, useEffect } from 'react';
import { getMyReservations, cancelReservation } from '../services/api';

function MyReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const response = await getMyReservations();
            setReservations(response.data);
        } catch (err) {
            setError('Napaka pri nalaganju rezervacij.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Ste prepričani, da želite preklicati to rezervacijo??')) return;

        try {
            await cancelReservation(id);
            fetchReservations();
        } catch (err) {
            alert(err.response?.data?.message || 'Rezervacije ni bilo mogoče preklicati.');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'confirmed': return { color: '#2ecc71' };
            case 'cancelled': return { color: '#e74c3c' };
            case 'pending': return { color: '#f39c12' };
            default: return {};
        }
    };

    if (loading) return <div style={styles.center}>Nalaganje rezervacij...</div>;
    if (error) return <div className="error" style={styles.center}>{error}</div>;

    return (
        <div style={styles.wrapper}>
            <h1 style={styles.title}>Moje rezervacije</h1>

            {reservations.length === 0 ? (
                <div className="card" style={styles.empty}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎟️</p>
                    <p style={{ color: '#aaa' }}>
                        Nimate še rezervacij.
                    </p>
                </div>
            ) : (
                reservations.map(reservation => (
                    <div key={reservation.id} className="card" style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div>
                                <h2 style={styles.filmTitle}>
                                    {reservation.film_title}
                                </h2>
                                <p style={styles.meta}>
                                    📅{' '}
                                    {new Date(reservation.start_time)
                                        .toLocaleDateString('en-GB', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                    }
                                    {' '}ob{' '}
                                    {new Date(reservation.start_time)
                                        .toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                    }
                                </p>
                                <p style={styles.meta}>
                                    🏛️ {reservation.room_name}
                                </p>
                                <p style={styles.meta}>
                                    💺 Sedeži: <strong>{reservation.seats}</strong>
                                </p>
                                <p style={styles.meta}>
                                    💰 Skupaj:{' '}
                                    <strong style={{ color: '#e50914' }}>
                                        €{reservation.total_price}
                                    </strong>
                                </p>
                            </div>

                            <div style={styles.cardRight}>
                                <span style={{
                                    ...styles.statusBadge,
                                    ...getStatusStyle(reservation.status)
                                }}>
                                    {reservation.status.toUpperCase()}
                                </span>

                                {reservation.status === 'confirmed' &&
                                 new Date(reservation.start_time) > new Date() && (
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleCancel(reservation.id)}
                                        style={{ marginTop: '12px' }}
                                    >
                                        Prekliči rezervacijo
                                    </button>
                                )}
                            </div>
                        </div>

                        <p style={styles.bookedAt}>
                            Rezervirano dne{' '}
                            {new Date(reservation.reserved_at)
                                .toLocaleDateString('en-GB')
                            }
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

const styles = {
    wrapper: { maxWidth: '700px', margin: '0 auto' },
    title: { fontSize: '32px', marginBottom: '24px' },
    card: { marginBottom: '16px' },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
    },
    cardRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        flexShrink: 0,
    },
    filmTitle: { fontSize: '20px', marginBottom: '10px' },
    meta: { color: '#ccc', fontSize: '14px', marginBottom: '6px' },
    statusBadge: {
        fontSize: '13px',
        fontWeight: 'bold',
        letterSpacing: '1px',
    },
    bookedAt: {
        color: '#555',
        fontSize: '12px',
        marginTop: '12px',
        borderTop: '1px solid #222',
        paddingTop: '10px',
    },
    empty: {
        textAlign: 'center',
        padding: '60px',
    },
    center: { textAlign: 'center', padding: '60px', color: '#aaa' },
};

export default MyReservations;