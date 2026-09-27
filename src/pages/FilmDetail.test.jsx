import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FilmDetail from './FilmDetail';
import { createPaymentIntent, getScreenings, getScreeningSeats } from '../services/api';
import { useAuth } from '../context/AuthContext';

vi.mock('../services/api', () => ({
    getScreenings: vi.fn(),
    getScreeningSeats: vi.fn(),
    createPaymentIntent: vi.fn(),
    cancelPaymentIntent: vi.fn(),
}));
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('@stripe/stripe-js', () => ({ loadStripe: vi.fn() }));
vi.mock('@stripe/react-stripe-js', () => ({ Elements: ({ children }) => children }));
vi.mock('../components/PaymentForm', () => ({ default: () => null }));

const predvajanje = {
    id: 5,
    film_title: 'Arrival',
    film_title_sl: 'Prihod',
    start_time: '2026-10-01T18:00:00.000Z',
    room_name: 'Dvorana 1',
    price: '7.50',
};
const film = { title: 'Arrival', title_sl: 'Prihod', screenings: [predvajanje] };

// Dve vrsti po trije sedeži; A2 je zaseden
const sedezi = ['A', 'B'].flatMap((vrsta, v) =>
    [1, 2, 3].map((st) => ({
        id: v * 3 + st,
        row_label: vrsta,
        seat_number: st,
        status: vrsta === 'A' && st === 2 ? 'taken' : 'available',
    }))
);

const prikazi = ({ state = { film, screening: predvajanje }, user = null } = {}) => {
    useAuth.mockReturnValue({ user });
    render(
        <MemoryRouter initialEntries={[{ pathname: '/films/5', state }]}>
            <Routes>
                <Route path="/films/:id" element={<FilmDetail />} />
                <Route path="/login" element={<p>Prijavna stran</p>} />
            </Routes>
        </MemoryRouter>
    );
};

// Sedež poiščemo po naslovu (title), npr. "Row B, Seat 1"
const sedez = (vrsta, st) => screen.getByTitle(new RegExp(`Row ${vrsta},\\s+Seat ${st}$`));

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    window.scrollTo = vi.fn();
    getScreeningSeats.mockResolvedValue({ data: sedezi });
});

describe('FilmDetail: izbira sedežev', () => {
    it('izbrani sedeži se prikažejo v povzetku s skupno ceno', async () => {
        prikazi();
        await screen.findByTitle(/Row A,\s+Seat 1$/);

        fireEvent.click(sedez('B', 1));
        fireEvent.click(sedez('B', 2));

        expect(screen.getByText('B1, B2')).toBeInTheDocument();
        expect(screen.getByText('€15.00')).toBeInTheDocument();
    });

    it('zasedenega sedeža ni mogoče izbrati', async () => {
        prikazi();
        await screen.findByTitle(/Row A,\s+Seat 2$/);

        fireEvent.click(sedez('A', 2));

        expect(screen.getByText('Ni izbranih sedežev.')).toBeInTheDocument();
    });

    it('ponoven klik na sedež ga odstrani iz izbire', async () => {
        prikazi();
        await screen.findByTitle(/Row A,\s+Seat 1$/);

        fireEvent.click(sedez('A', 1));
        fireEvent.click(sedez('A', 1));

        expect(screen.getByText('Ni izbranih sedežev.')).toBeInTheDocument();
    });

    it('neprijavljenega uporabnika pred plačilom preusmeri na prijavo', async () => {
        prikazi();
        await screen.findByTitle(/Row A,\s+Seat 1$/);

        fireEvent.click(sedez('A', 1));
        fireEvent.click(screen.getByRole('button', { name: /Nadaljuj na plačilo/ }));

        expect(await screen.findByText('Prijavna stran')).toBeInTheDocument();
        expect(createPaymentIntent).not.toHaveBeenCalled();
    });

    it('ob neposrednem odprtju povezave naloži podatke o filmu iz sporeda', async () => {
        getScreenings.mockResolvedValue({
            data: [{ ...predvajanje, genre: 'Znanstvena fantastika' }],
        });

        prikazi({ state: null });

        expect(await screen.findByText('Prihod')).toBeInTheDocument();
        expect(getScreenings).toHaveBeenCalled();
    });
});
