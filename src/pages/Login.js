import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, resendVerification } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [resending, setResending] = useState(false);

    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResendMessage('');
        setNeedsVerification(false);
        setLoading(true);

        try {
            const response = await login({ email, password });
            loginUser(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Prišlo je do napake.');
            if (err.response?.data?.requiresVerification) {
                setNeedsVerification(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setResendMessage('');
        try {
            const response = await resendVerification(email);
            setResendMessage(response.data.message);
        } catch (err) {
            setResendMessage('Sporočila ni bilo mogoče poslati. Poskusite znova.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>Dobrodošli nazaj</h2>
                <p style={styles.subtitle}>Prijavite se v svoj račun</p>

                {error && <div className="error">{error}</div>}

                {needsVerification && (
                    <div style={styles.resendBox}>
                        {resendMessage ? (
                            <p style={styles.resendMessage}>{resendMessage}</p>
                        ) : (
                                                        <button
                                type="button"
                                className="btn"
                                style={styles.resendBtn}
                                onClick={handleResend}
                                disabled={resending || !email}
                            >
                                {resending ? 'Pošiljanje...' : 'Znova pošlji potrditveno povezavo'}
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label>E-poštni naslov</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="janez@gmail.com"
                        required
                    />

                    <label>Geslo</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Vaše geslo"
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                        disabled={loading}
                    >
                        {loading ? 'Prijavljanje...' : 'Prijava'}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Nimate računa?{' '}
                    <Link to="/register" style={styles.switchLink}>
                        Registirirajte se tukaj
                    </Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
    },
    title: {
        fontSize: '26px',
        marginBottom: '6px',
    },
    subtitle: {
        color: '#aaa',
        marginBottom: '24px',
    },
    resendBox: {
        marginBottom: '16px',
    },
    resendMessage: {
        color: '#aaa',
        fontSize: '14px',
        textAlign: 'center',
    },
        resendBtn: {
        width: '100%',
        background: 'rgba(123,97,255,0.15)',
        color: '#7b61ff',
        border: '1px solid rgba(123,97,255,0.4)',
    },
    switchText: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#aaa',
        fontSize: '14px',
    },
    switchLink: {
        color: '#e50914',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};

export default Login;