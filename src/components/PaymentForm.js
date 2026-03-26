import { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { confirmPayment } from '../services/api';

function PaymentForm({ screeningId, seatIds, totalPrice, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError('');

        try {
            // Confirm payment with Stripe
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
                // Tell our backend to create the reservation
                const response = await confirmPayment({
                    payment_intent_id: paymentIntent.id,
                    screening_id: screeningId,
                    seat_ids: seatIds,
                });

                onSuccess(response.data);
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed.');
            setProcessing(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <h3 style={styles.title}>Complete Payment</h3>
            <p style={styles.amount}>
                Total: <span style={styles.price}>€{totalPrice}</span>
            </p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={styles.cardContainer}>
                    <PaymentElement />
                </div>

                <div style={styles.buttons}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={processing || !stripe}
                        style={{ flex: 1 }}
                    >
                        {processing ? 'Processing...' : `Pay €${totalPrice}`}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        Cancel
                    </button>
                </div>

                <p style={styles.testNote}>
                    🔒 Test mode — use card <strong>4242 4242 4242 4242</strong>,
                    any future expiry and any 3 digit CVC
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
    amount: { color: '#aaa', marginBottom: '20px' },
    price: { color: '#e50914', fontWeight: 'bold', fontSize: '20px' },
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