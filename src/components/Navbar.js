import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo-transparent.png';

function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>
                {/* Logo */}
                <Link to="/" style={styles.logo}>
    <img src={logo} alt="KinoPlex" style={styles.logoImg} />
    <div style={styles.logoTextGroup}>
        <span style={styles.logoText}>KinoPlex</span>
        <span style={styles.logoSlogan}>Kino v vaših rokah</span>
    </div>
</Link>
{/*🎬*/}
                {/* navigacija povezave */}
                <div style={styles.links}>
                    <Link to="/" style={styles.link}>Domov</Link>
                    <Link to="/program" style={styles.link}>Program</Link>
                    {user && (
                        <Link to="/my-reservations" style={styles.link}>
                            Moje vstopnice
                        </Link>
                    )}
                    {user?.role === 'admin' && (
                        <Link to="/admin" style={styles.link}>Admin</Link>
                    )}
                </div>

                {/* Avtorizacija */}
                <div style={styles.auth}>
                    {user ? (
                        <>
                            <span style={styles.greeting}>
                                Pozdravljeni, {user.first_name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary"
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                            >
                                Odjava
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', fontSize: '13px' }}
                                >
                                    Prijava
                                </button>
                            </Link>
                            <Link to="/register">
                                <button
                                    className="btn btn-primary"
                                    style={{ padding: '8px 16px', fontSize: '13px' }}
                                >
                                    Registracija
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        background: 'rgba(8,11,26,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    inner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
    },
    logoIcon: { fontSize: '24px' },
    logoText: {
        fontSize: '20px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #00c9b1, #7b61ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px',
    },
    logoImg: {
    height: '36px',
    width: 'auto',
    objectFit: 'contain',
},
logoTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
},
logoSlogan: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.5px',
    fontWeight: '400',
},
    links: {
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
    },
    link: {
        color: 'rgba(255,255,255,0.75)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'color 0.2s',
    },
    auth: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    greeting: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '13px',
    },
};

export default Navbar;