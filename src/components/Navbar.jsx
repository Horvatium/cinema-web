import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo-transparent.png';
import './Navbar.css';

// Navigacijska vrstica, prilepljena na vrh vseh strani. Vsebina se prilagodi
// stanju prijave: gost vidi gumba za prijavo in registracijo, prijavljeni
// pozdrav in odjavo, skrbnik pa še povezavo na skrbniško ploščo. Na ozkih
// zaslonih se povezave in gumbi skrijejo v meni, ki ga odpre gumb ☰.
function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Ob prehodu na drugo stran se meni zapre
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Po odjavi uporabnika vrnemo na domačo stran, ker so nekatere
    // strani brez prijave nedostopne
    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <nav style={styles.nav}>
            <div className="nav-inner">
                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    <img src={logo} alt="KinoPlex" style={styles.logoImg} />
                    <div style={styles.logoTextGroup}>
                        <span style={styles.logoText}>KinoPlex</span>
                        <span style={styles.logoSlogan}>Kino v vaših rokah</span>
                    </div>
                </Link>
                <button
                    type="button"
                    className="nav-toggle"
                    aria-label={menuOpen ? 'Zapri meni' : 'Odpri meni'}
                    aria-expanded={menuOpen}
                    aria-controls="nav-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>

                <div id="nav-menu" className={menuOpen ? 'nav-menu open' : 'nav-menu'}>
                    {/* navigacija povezave */}
                    <div className="nav-links">
                        <Link to="/" style={styles.link}>
                            Domov
                        </Link>
                        <Link to="/program" style={styles.link}>
                            Program
                        </Link>
                        {user && (
                            <Link to="/my-reservations" style={styles.link}>
                                Moje vstopnice
                            </Link>
                        )}
                        {/* Povezava na skrbniško ploščo je zgolj skrita, ne zaščitena —
                        za dostop skrbi ProtectedRoute, za pravice pa zaledje */}
                        {user?.role === 'admin' && (
                            <Link to="/admin" style={{ ...styles.link, ...styles.adminLink }}>
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Avtorizacija */}
                    <div className="nav-auth">
                        {user ? (
                            <>
                                <span style={styles.greeting}>Pozdravljeni, {user.first_name}</span>
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
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
    },
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
    link: {
        color: 'rgba(255,255,255,0.75)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'color 0.2s',
    },
    adminLink: {
        color: '#e50914',
        fontWeight: '700',
    },
    greeting: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '13px',
    },
};

export default Navbar;
