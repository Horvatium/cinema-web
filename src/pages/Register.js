import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            return setError('Gesla se ne ujemata.');
        }
        if (form.password.length < 6) {
            return setError('Geslo mora vsebovati vsaj 6 znakov.');
        }

        setLoading(true);

        try {
            const response = await register({
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
                phone: form.phone,
            });
            loginUser(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Nekaj se je pojavila napaka.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>Ustvari račun</h2>
                <p style={styles.subtitle}>Pridruži se, da pričneš z nakupom kart</p>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.row}>
                        <div style={styles.half}>
                            <label>Ime</label>
                            <input
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                placeholder="John"
                                required
                            />
                        </div>
                        <div style={styles.half}>
                            <label>Priimek</label>
                            <input
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>

                    <label>E-mail</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                    />

                    <label>Telefon (neobvezno)</label>
                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="041 234 567"
                    />

                    <label>Geslo</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Vsaj 6 znakov"
                        required
                    />

                    <label>Potrdi geslo</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Ponovi geslo"
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                        disabled={loading}
                    >
                        {loading ? 'Ustvarjam račun...' : 'Ustvari račun'}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Že imate račun?{' '}
                    <Link to="/login" style={styles.switchLink}>
                        Prijavite se tukaj
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
        maxWidth: '460px',
    },
    title: {
        fontSize: '26px',
        marginBottom: '6px',
    },
    subtitle: {
        color: '#aaa',
        marginBottom: '24px',
    },
    row: {
        display: 'flex',
        gap: '12px',
    },
    half: {
        flex: 1,
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

export default Register;