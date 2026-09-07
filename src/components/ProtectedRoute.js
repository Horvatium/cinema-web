import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ovojnica okoli strani, ki zahtevajo prijavo. Uporablja se v App.js;
// z adminOnly omeji dostop še na skrbnike.
function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();

    // Dokler se seja obnavlja iz localStorage, uporabnika še ne poznamo.
    // Brez tega koraka bi prijavljenega uporabnika ob osvežitvi strani
    // za trenutek videli kot neprijavljenega in ga vrgli na prijavo.
    if (loading) return <div>Nalaganje...</div>;

    if (!user) return <Navigate to="/login" />;

    // Vloga je le v žetonu, zato je to samo skrivanje vmesnika —
    // pravo preverjanje pravic opravi zaledje pri vsakem klicu
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

    return children;
}

export default ProtectedRoute;