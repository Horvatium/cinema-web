import axios from 'axios';

// Naslov API-ja se določi ob gradnji (VITE_API_URL), npr. v Dockerju
// http://localhost:5000/api. Brez nastavitve se uporabi produkcijski API na
// poddomeni api.kinoplex.si, ki je na istem mestu kot spletna stran, zato
// brskalnik piškotek seje pošilja kot piškotek prve osebe.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://api.kinoplex.si/api',
    // Seja je v piškotku httpOnly, ki ga nastavi API; JavaScript žetona ne vidi
    withCredentials: true,
});

// Poti, pri katerih odgovor 401 ne pomeni, da je seja potekla: /auth/me
// neprijavljenemu obiskovalcu vedno vrne 401, prijava pa ob napačnem geslu
const BREZ_PREUSMERITVE = ['/auth/me', '/auth/login'];

// Ob poteku ali neveljavni seji uporabnika pošlji na prijavo
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (
            (status === 401 || status === 403) &&
            !BREZ_PREUSMERITVE.includes(error.config?.url) &&
            window.location.pathname !== '/login'
        ) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Avtorizacija
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const resendVerification = (email) => api.post('/auth/resend-verification', { email });

// Filmi
export const getFilms = () => api.get('/films');
export const getFilm = (id) => api.get(`/films/${id}`);
export const addFilm = (data) => api.post('/films', data);
export const updateFilm = (id, data) => api.put(`/films/${id}`, data);
export const deleteFilm = (id) => api.delete(`/films/${id}`);

// Predstave
export const getScreenings = () => api.get('/screenings');
export const getScreeningSeats = (id) => api.get(`/screenings/${id}/seats`);
export const addScreening = (data) => api.post('/screenings', data);
export const updateScreening = (id, data) => api.put(`/screenings/${id}`, data);
export const deleteScreening = (id) => api.delete(`/screenings/${id}`);

// Dvorane
export const getRooms = () => api.get('/rooms');
export const addRoom = (data) => api.post('/rooms', data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);

// Rezervacije
export const getMyReservations = () => api.get('/reservations/my');
export const getAllReservations = () => api.get('/reservations');
export const cancelReservation = (id) => api.put(`/reservations/${id}/cancel`);
export const uploadPoster = (formData) =>
    api.post('/upload/poster', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// Plačila
export const createPaymentIntent = (data) => api.post('/payments/create-intent', data);
export const confirmPayment = (data) => api.post('/payments/confirm', data);
export const cancelPaymentIntent = (data) => api.post('/payments/cancel-intent', data);

// Uporabniki
export const getUsers = () => api.get('/users');
export const deleteUser = (id) => api.delete(`/users/${id}`);
