import axios from 'axios';

const api = axios.create({
    baseURL: 'cinema-api-production-a533.up.railway.app/api',
    //baseURL: 'http://192.168.0.17:5000/api',
});


//baseURL: 'http://localhost:5000/api',
// Samodejno priloži žeton vsaki zahtevi
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Avtorizacija
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

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

// Rezervacije
export const getMyReservations = () => api.get('/reservations/my');
export const getAllReservations = () => api.get('/reservations');
export const createReservation = (data) => api.post('/reservations', data);
export const cancelReservation = (id) => api.put(`/reservations/${id}/cancel`);
export const uploadPoster = (formData) => api.post('/upload/poster', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Plačila
export const createPaymentIntent = (data) => api.post('/payments/create-intent', data);
export const confirmPayment = (data) => api.post('/payments/confirm', data);