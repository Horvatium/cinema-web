import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));

// Zaščitena stran /admin, okoli nje pa strani, na katere lahko preusmeri
const prikazi = (auth, adminOnly = false) => {
    useAuth.mockReturnValue(auth);
    render(
        <MemoryRouter initialEntries={['/admin']}>
            <Routes>
                <Route path="/" element={<p>Domača stran</p>} />
                <Route path="/login" element={<p>Prijava</p>} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly={adminOnly}>
                            <p>Zaščitena vsebina</p>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
};

describe('ProtectedRoute', () => {
    it('med obnavljanjem seje ne preusmeri, ampak prikaže nalaganje', () => {
        prikazi({ user: null, loading: true });
        expect(screen.getByText('Nalaganje...')).toBeInTheDocument();
    });

    it('neprijavljenega uporabnika preusmeri na prijavo', () => {
        prikazi({ user: null, loading: false });
        expect(screen.getByText('Prijava')).toBeInTheDocument();
        expect(screen.queryByText('Zaščitena vsebina')).not.toBeInTheDocument();
    });

    it('prijavljenemu uporabniku prikaže vsebino', () => {
        prikazi({ user: { id: 2, role: 'customer' }, loading: false });
        expect(screen.getByText('Zaščitena vsebina')).toBeInTheDocument();
    });

    it('stranko s skrbniške strani preusmeri na domačo stran', () => {
        prikazi({ user: { id: 2, role: 'customer' }, loading: false }, true);
        expect(screen.getByText('Domača stran')).toBeInTheDocument();
    });

    it('skrbniku prikaže skrbniško stran', () => {
        prikazi({ user: { id: 1, role: 'admin' }, loading: false }, true);
        expect(screen.getByText('Zaščitena vsebina')).toBeInTheDocument();
    });
});
