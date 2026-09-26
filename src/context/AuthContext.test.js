import { act, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Neveljaven podpis ne moti: kontekst prebere samo polje exp
const zeton = (expSekunde) => `glava.${btoa(JSON.stringify({ exp: expSekunde }))}.podpis`;
const cezSekund = (s) => Math.floor(Date.now() / 1000) + s;

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

beforeEach(() => localStorage.clear());
afterEach(() => jest.useRealTimers());

describe('AuthContext', () => {
    it('obnovi sejo iz localStorage, če žeton še velja', () => {
        localStorage.setItem('user', JSON.stringify({ first_name: 'Demo' }));
        localStorage.setItem('token', zeton(cezSekund(3600)));

        prikazi();

        expect(screen.getByText('prijavljen: Demo')).toBeInTheDocument();
    });

    it('potekel žeton ob zagonu zavrže in počisti localStorage', () => {
        localStorage.setItem('user', JSON.stringify({ first_name: 'Demo' }));
        localStorage.setItem('token', zeton(cezSekund(-60)));

        prikazi();

        expect(screen.getByText('neprijavljen')).toBeInTheDocument();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('ob prijavi shrani sejo, da preživi osvežitev strani', () => {
        prikazi();
        const token = zeton(cezSekund(3600));

        act(() => auth.loginUser({ first_name: 'Ana' }, token));

        expect(screen.getByText('prijavljen: Ana')).toBeInTheDocument();
        expect(localStorage.getItem('token')).toBe(token);
    });

    it('uporabnika odjavi v trenutku, ko žeton poteče', () => {
        jest.useFakeTimers();
        prikazi();

        act(() => auth.loginUser({ first_name: 'Ana' }, zeton(cezSekund(60))));
        expect(screen.getByText('prijavljen: Ana')).toBeInTheDocument();

        act(() => jest.advanceTimersByTime(61 * 1000));
        expect(screen.getByText('neprijavljen')).toBeInTheDocument();
    });
});
