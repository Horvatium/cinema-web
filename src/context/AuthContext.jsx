import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, logout } from '../services/api';

const AuthContext = createContext();

// Hrani podatke o prijavljenem uporabniku in jih ponudi celotni aplikaciji,
// da jih ni treba podajati skozi lastnosti komponent. Žeton je v piškotku
// httpOnly, ki ga JavaScript ne more prebrati; kdo je prijavljen in kdaj seja
// poteče, pove API (GET /auth/me).
export function AuthProvider({ children }) {
    // loading loči "še ne vem" od "ni prijavljen" (glej ProtectedRoute)
    const [user, setUser] = useState(null);
    const [potek, setPotek] = useState(null);
    const [loading, setLoading] = useState(true);

    // Stanje počistimo takoj, piškotek pa pobriše API. Napake pri odjavi ne
    // prikazujemo: seja je bila morda že neveljavna.
    const logoutUser = useCallback(async () => {
        setUser(null);
        setPotek(null);
        try {
            await logout();
        } catch {
            /* piškotek je morda že potekel */
        }
    }, []);

    useEffect(() => {
        // Starejše različice so žeton hranile v localStorage; ostanke pobrišemo
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // Ob nalaganju strani vprašamo API, ali seja še velja
        let preklicano = false;
        getMe()
            .then((response) => {
                if (preklicano) return;
                setUser(response.data.user);
                setPotek(new Date(response.data.expiresAt).getTime());
            })
            .catch(() => {
                /* neprijavljen obiskovalec */
            })
            .finally(() => {
                if (!preklicano) setLoading(false);
            });
        return () => {
            preklicano = true;
        };
    }, []);

    // Ko seja poteče med odprto stranjo, odjavi takoj in ne šele ob
    // naslednjem klicu API
    useEffect(() => {
        if (!potek) return;
        const timer = setTimeout(logoutUser, Math.max(potek - Date.now(), 0));
        return () => clearTimeout(timer);
    }, [potek, logoutUser]);

    // Po prijavi API nastavi piškotek; tu si zapomnimo samo uporabnika in rok
    const loginUser = (userData, expiresAt) => {
        setUser(userData);
        setPotek(new Date(expiresAt).getTime());
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
