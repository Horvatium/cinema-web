import { act, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { getMe, logout } from '../services/api';

vi.mock('../services/api', () => ({ getMe: vi.fn(), logout: vi.fn() }));

const cezSekund = (s) => new Date(Date.now() + s * 1000).toISOString();

// Komponenta, ki izpiše stanje konteksta in ponudi prijavo
let auth;
function Stanje() {
    auth = useAuth();
    if (auth.loading) return <p>nalaganje</p>;
    return <p>{auth.user ? `prijavljen: ${auth.user.first_name}` : 'neprijavljen'}</p>;
}

const prikazi = () =>
    render(
        <AuthProvider>
            <Stanje />
        </AuthProvider>
    );

const neprijavljen = () => getMe.mockRejectedValue({ response: { status: 401 } });

beforeEach(() => {
    vi.clearAllMocks();
    logout.mockResolvedValue({});
});
afterEach(() => vi.useRealTimers());

describe('AuthContext', () => {
    it('obnovi sejo, ki jo API potrdi (piškotek še velja)', async () => {
        getMe.mockResolvedValue({
            data: { user: { first_name: 'Demo' }, expiresAt: cezSekund(3600) },
        });

        prikazi();

        expect(await screen.findByText('prijavljen: Demo')).toBeInTheDocument();
    });

    it('brez veljavne seje pokaže neprijavljenega obiskovalca', async () => {
        neprijavljen();

        prikazi();

        expect(await screen.findByText('neprijavljen')).toBeInTheDocument();
    });

    it('pobriše žeton, ki so ga v localStorage pustile starejše različice', async () => {
        localStorage.setItem('token', 'star-zeton');
        localStorage.setItem('user', '{}');
        neprijavljen();

        prikazi();

        await screen.findByText('neprijavljen');
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('po prijavi prikaže uporabnika, žetona pa ne shrani v localStorage', async () => {
        neprijavljen();
        prikazi();
        await screen.findByText('neprijavljen');

        act(() => auth.loginUser({ first_name: 'Ana' }, cezSekund(3600)));

        expect(screen.getByText('prijavljen: Ana')).toBeInTheDocument();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('odjava počisti stanje in API pobriše piškotek', async () => {
        neprijavljen();
        prikazi();
        await screen.findByText('neprijavljen');
        act(() => auth.loginUser({ first_name: 'Ana' }, cezSekund(3600)));

        await act(() => auth.logoutUser());

        expect(screen.getByText('neprijavljen')).toBeInTheDocument();
        expect(logout).toHaveBeenCalledTimes(1);
    });

    it('uporabnika odjavi v trenutku, ko seja poteče', async () => {
        neprijavljen();
        prikazi();
        await screen.findByText('neprijavljen');
        vi.useFakeTimers();

        act(() => auth.loginUser({ first_name: 'Ana' }, cezSekund(60)));
        expect(screen.getByText('prijavljen: Ana')).toBeInTheDocument();

        await act(() => vi.advanceTimersByTime(61 * 1000));
        expect(screen.getByText('neprijavljen')).toBeInTheDocument();
        expect(logout).toHaveBeenCalled();
    });
});
