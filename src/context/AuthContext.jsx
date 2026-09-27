import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

// Vrne čas poteka žetona v milisekundah ali null, če ga ni mogoče prebrati.
// Podpisa ne preverjamo (to zna le zaledje), zanima nas samo polje exp.
function casPoteka(token) {
    try {
        const del = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const { exp } = JSON.parse(atob(del + '='.repeat((4 - (del.length % 4)) % 4)));
        return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
        return null;
    }
}

// Hrani podatke o prijavljenem uporabniku in jih ponudi celotni aplikaciji,
// da jih ni treba podajati skozi lastnosti komponent.
export function AuthProvider({ children }) {
    // loading loči "še ne vem" od "ni prijavljen" (glej ProtectedRoute)
    const [user, setUser] = useState(null);
    const [potek, setPotek] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ob odjavi počisti oboje; isto pokliče prestreznik v api.js ob poteku žetona
    const logoutUser = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setPotek(null);
    }, []);

    useEffect(() => {
        // Preveri ali je bil uporabnik že prej prijavljen. Potekel žeton
        // takoj zavržemo, sicer bi bil uporabnik prijavljen le na videz.
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const cas = storedToken ? casPoteka(storedToken) : null;
        if (storedUser && cas > Date.now()) {
            setUser(JSON.parse(storedUser));
            setPotek(cas);
        } else {
            logoutUser();
        }
        setLoading(false);
    }, [logoutUser]);

    // Ko žeton poteče med odprto stranjo, odjavi takoj in ne šele ob
    // naslednjem klicu API
    useEffect(() => {
        if (!potek) return;
        const timer = setTimeout(logoutUser, Math.max(potek - Date.now(), 0));
        return () => clearTimeout(timer);
    }, [potek, logoutUser]);

    // Ob prijavi shrani sejo, da preživi osvežitev strani in zaprtje zavihka
    const loginUser = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
        setPotek(casPoteka(token));
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// Bližnjica, da komponentam ni treba uvažati konteksta in useContext posebej.
// Kavelj je v isti datoteki kot ponudnik, zato Fast Refresh ob spremembi te
// datoteke osveži celo stran; to je sprejemljivo.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
