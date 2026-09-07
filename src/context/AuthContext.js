import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Hrani podatke o prijavljenem uporabniku in jih ponudi celotni aplikaciji,
// da jih ni treba podajati skozi lastnosti komponent.
export function AuthProvider({ children }) {
    // loading loči "še ne vem" od "ni prijavljen" (glej ProtectedRoute)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Preveri ali je bil uporabnik že prej prijavljen
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Ob prijavi shrani sejo, da preživi osvežitev strani in zaprtje zavihka
    const loginUser = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    // Ob odjavi počisti oboje; isto pokliče prestreznik v api.js ob poteku žetona
    const logoutUser = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// Bližnjica, da komponentam ni treba uvažati konteksta in useContext posebej
export function useAuth() {
    return useContext(AuthContext);
}