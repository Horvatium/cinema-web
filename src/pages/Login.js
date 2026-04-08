import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login({ email, password });
            loginUser(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Prišlo je do napake.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>Dobrodošli nazaj</h2>
                <p style={styles.subtitle}>Prijavite se v svoj račun</p>

                {error && <div className="error">{error}</div>}

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