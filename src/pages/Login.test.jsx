import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

vi.mock('../services/api', () => ({ login: vi.fn(), resendVerification: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));

const loginUser = vi.fn();

const prikazi = () => {
    useAuth.mockReturnValue({ loginUser });
    render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/" element={<p>Domača stran</p>} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </MemoryRouter>
    );
};

const vpisiInPrijavi = (email, geslo) => {
    fireEvent.change(screen.getByPlaceholderText('janez@gmail.com'), { target: { value: email } });
    fireEvent.change(screen.getByPlaceholderText('Vaše geslo'), { target: { value: geslo } });
    fireEvent.click(screen.getByRole('button', { name: 'Prijava' }));
};

beforeEach(() => vi.clearAllMocks());

describe('Login', () => {
    it('ob uspešni prijavi shrani sejo in preusmeri na domačo stran', async () => {
        login.mockResolvedValue({
            data: { user: { first_name: 'Demo' }, expiresAt: '2030-01-01T00:00:00.000Z' },
        });
        prikazi();

        vpisiInPrijavi('demo@kinoplex.test', 'Demo123!');

        expect(await screen.findByText('Domača stran')).toBeInTheDocument();
        expect(login).toHaveBeenCalledWith({ email: 'demo@kinoplex.test', password: 'Demo123!' });
        expect(loginUser).toHaveBeenCalledWith({ first_name: 'Demo' }, '2030-01-01T00:00:00.000Z');
    });

    it('ob napačnem geslu prikaže sporočilo zaledja in ostane na prijavi', async () => {
        login.mockRejectedValue({
            response: { data: { message: 'Napačen elektronski naslov ali geslo.' } },
        });
        prikazi();

        vpisiInPrijavi('demo@kinoplex.test', 'narobe');

        expect(
            await screen.findByText('Napačen elektronski naslov ali geslo.')
        ).toBeInTheDocument();
        expect(loginUser).not.toHaveBeenCalled();
    });

    it('ob nepotrjenem naslovu ponudi ponovno pošiljanje povezave', async () => {
        login.mockRejectedValue({
            response: {
                data: { message: 'Naslov še ni potrjen.', requiresVerification: true },
            },
        });
        prikazi();

        vpisiInPrijavi('nov@kinoplex.test', 'Geslo123!');

        expect(await screen.findByText('Naslov še ni potrjen.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /znova pošlji/i })).toBeInTheDocument();
    });
});
