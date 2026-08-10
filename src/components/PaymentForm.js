import { useState, useEffect, useRef } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { confirmPayment } from '../services/api';

function PaymentForm({ screeningId, seatIds, totalPrice, expiresAt, onSuccess, onCancel, onExpire }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [preostalo, setPreostalo] = useState(null);

    // Sklic na funkcijo ob izteku, da odštevalnik ni odvisen od ponovnih izrisov
    const onExpireRef = useRef(onExpire);
    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    // Odštevalnik zadržanja sedežev
    useEffect(() => {
        if (!expiresAt) return;

        const konec = new Date(expiresAt).getTime();
        let izteklo = false;

        const posodobi = () => {
            const sekunde = Math.max(0, Math.round((konec - Date.now()) / 1000));
            setPreostalo(sekunde);
            if (sekunde === 0 && !izteklo) {
                izteklo = true;
                if (onExpireRef.current) onExpireRef.current();
            }
        };

        posodobi();
        const id = setInterval(posodobi, 1000);
        return () => clearInterval(id);
    }, [expiresAt]);

    const zapisiCas = (s) =>
        `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const potekel = preostalo === 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || potekel) return;

        setProcessing(true);
        setError('');

        try {
            // Potrdi plačilo s Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // Zaledni sistem naj potrdi rezervacijo
                const response = await confirmPayment({
                    payment_intent_id: paymentIntent.id,
                    screening_id: screeningId,
                    seat_ids: seatIds,
                });

                onSuccess(response.data);
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Plačilo ni uspelo.');
            setProcessing(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <h3 style={styles.title}>Zaključi plačilo</h3>
            <p style={styles.amount}>
                Skupaj: <span style={styles.price}>{totalPrice} €</span>
            </p>

            {preostalo !== null && !potekel && (
                <p style={preostalo <= 60 ? styles.timerOpozorilo : styles.timer}>
                    Izbrani sedeži so za vas zadržani še <strong>{zapisiCas(preostalo)}</strong>
                </p>
            )}

            {potekel && (
                <div className="error">
                    Čas za dokončanje plačila je potekel, sedeži so bili sproščeni.
                </div>
            )}

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={styles.cardContainer}>
                    <PaymentElement />
                </div>

                <div style={styles.buttons}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={processing || !stripe || potekel}
                        style={{ flex: 1 }}
                    >
                        {processing ? 'Obdelava...' : `Plačaj ${totalPrice} €`}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        Prekliči
                    </button>
                </div>

                <p style={styles.testNote}>
                    🔒 Testni način — uporabite kartico <strong>4242 4242 4242 4242</strong>,
                    prihodnji datum izteka in poljubno 3-mestno kodo CVC
                </p>
            </form>
        </div>
    );
}

const styles = {
    wrapper: {
        background: '#1a1a1a',
        borderRadius: '10px',
        padding: '24px',
        marginTop: '20px',
    },
    title: { fontSize: '20px', marginBottom: '8px' },
    amount: { color: '#aaa', marginBottom: '12px' },
    price: { color: '#e50914', fontWeight: 'bold', fontSize: '20px' },
    timer: { color: '#aaa', fontSize: '14px', marginBottom: '16px' },
    timerOpozorilo: { color: '#e50914', fontSize: '14px', marginBottom: '16px' },
    cardContainer: {
        background: '#fff',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
    },
    buttons: {
        display: 'flex',
        gap: '10px',
        marginTop: '16px',
        marginBottom: '16px',
    },
    testNote: {
        color: '#666',
        fontSize: '12px',
        textAlign: 'center',
        marginTop: '8px',
    },
};

export default PaymentForm;