import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>🎬 CinemaApp</Link>

            <div style={styles.links}>
                <Link to="/" style={styles.link}>Home</Link>

                {user && (
                    <Link to="/my-reservations" style={styles.link}>
                        My Reservations
                    </Link>
                )}

                {user?.role === 'admin' && (
                    <Link to="/admin" style={styles.link}>
                        Admin Panel
                    </Link>
                )}

                {user ? (
                    <div style={styles.userSection}>
                        <span style={styles.userName}>
                            Hi, {user.first_name}!
                        </span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div style={styles.userSection}>
                        <Link to="/login">
                            <button className="btn btn-secondary">Login</button>
                        </Link>
                        <Link to="/register">
                            <button className="btn btn-primary">Register</button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        background: '#111111',
        padding: '14px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #e50914',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    logo: {
        color: '#e50914',
        fontSize: '22px',
        fontWeight: 'bold',
        textDecoration: 'none',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    link: {
        color: '#f0f0f0',
        textDecoration: 'none',
        fontSize: '15px',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    userName: {
        color: '#aaa',
        fontSize: '14px',
    },
};

export default Navbar;