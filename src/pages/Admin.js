import {
    getFilms, addFilm, updateFilm, deleteFilm,
    getScreenings, addScreening, updateScreening, deleteScreening, getRooms, addRoom, updateRoom, deleteRoom,
    getAllReservations, uploadPoster, getUsers, deleteUser
} from '../services/api';
import { useState, useEffect } from 'react';

function Admin() {
    const [tab, setTab] = useState('screenings');

    return (
        <div>
            <h1 style={styles.title}>Skrbniška plošča</h1>

            {/* vrstica z zavihki */}
            <div style={styles.tabBar}>
                {['screenings', 'films', 'rooms','reservations','users'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className="btn"
                        style={{
                            ...styles.tabBtn,
                            background: tab === t ? '#e50914' : '#222',
                        }}
                    >
                        {{ screenings: 'Predvajanja', films: 'Filmi', rooms: 'Dvorane', reservations: 'Rezervacije', users: 'Uporabniki' }[t]}
                    </button>
                ))}
            </div>

            {tab === 'screenings' && <ScreeningsTab />}
            {tab === 'films' && <FilmsTab />}
            {tab === 'rooms' && <RoomsTab />}
            {tab === 'reservations' && <ReservationsTab />}
            {tab === 'users' && <UsersTab />}
        </div>
    );
}

// vrstica s predstavami
function ScreeningsTab() {
    const [screenings, setScreenings] = useState([]);
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dodaj stanje obrazca
    const [addForm, setAddForm] = useState({
        film_id: '', room_id: '', start_time: '', end_time: '', price: ''
    });
        const [rooms, setRooms] = useState([]);

    // Uredi stanje
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        film_id: '', room_id: '', start_time: '', end_time: '', price: ''
    });

       useEffect(() => {
        Promise.all([getScreenings(), getFilms(), getRooms()])
            .then(([sRes, fRes, rRes]) => {
                setScreenings(sRes.data);
                setFilms(fRes.data);
                setRooms(rRes.data);
            })
            .catch(() => setError('Podatkov ni bilo mogoče naložiti.'))
            .finally(() => setLoading(false));
    }, []);

    const refreshScreenings = async () => {
        const response = await getScreenings();
        setScreenings(response.data);
    };

    const handleAddChange = (e) => {
        setAddForm({ ...addForm, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await addScreening(addForm);
            setSuccess('Predstava je bila uspešno dodana!');
            setAddForm({
                film_id: '', room_id: '',
                start_time: '', end_time: '', price: ''
            });
            await refreshScreenings();
        } catch (err) {
            setError(err.response?.data?.message || 'Predstave ni bilo mogoče dodati.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Želite izbrisati to predstavo? Vse rezervacije bodo preklicane..')) return;
        try {
            await deleteScreening(id);
            setScreenings(screenings.filter(s => s.id !== id));
            setSuccess('Predstava izbrisana.');
        } catch (_err) {
            setError('Predstave ni bilo mogoče izbrisati.');
        }
    };

    // Začni urejanje – vnaprej izpolni obrazec za urejanje s trenutnimi vrednostmi

    const startEdit = (screening) => {
        setEditingId(screening.id);
        setError('');
        setSuccess('');

        // Pretvori datum in čas v lokalno obliko za vnos datuma in časa

        const toLocalInput = (dateStr) => {
            const d = new Date(dateStr);
            const offset = d.getTimezoneOffset();
            const local = new Date(d.getTime() - offset * 60000);
            return local.toISOString().slice(0, 16);
        };

        setEditForm({
            film_id: screening.film_id || '',
            room_id: screening.room_id || '',
            start_time: toLocalInput(screening.start_time),
            end_time: toLocalInput(screening.end_time),
            price: screening.price,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({
            film_id: '', room_id: '',
            start_time: '', end_time: '', price: ''
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await updateScreening(editingId, editForm);
            const affected = response.data.affectedReservations;
            setSuccess(
                `Predstava posodobljena!${affected > 0
                    ? ` Opomba: ${affected} obstoječe rezervacije so prizadete.`
                    : ''
                }`
            );
            setEditingId(null);
            await refreshScreenings();
        } catch (err) {
             setError(err.response?.data?.message || 'Predstave ni bilo mogoče posodobiti.');
        }
    };

    /*const rooms = [
        { id: '1', name: 'Dvorana 1' },
        { id: '2', name: 'Dvorana 2' },
        { id: '3', name: 'VIP Dvorana' },
    ];*/

    if (loading) return <p style={{ color: '#aaa' }}>Nalaganje...</p>;

    return (
        <div>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {/* ── Dodaj obrazec za predstavo ── */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h2 style={styles.sectionTitle}>Dodaj novo predvajanje</h2>
                <form onSubmit={handleAdd}>
                    <label>Film</label>
                    <select
                        name="film_id"
                        value={addForm.film_id}
                        onChange={handleAddChange}
                        required
                    >
                        <option value="">Izberi film...</option>
                        {films.map(f => (
                            <option key={f.id} value={f.id}>{f.title}</option>
                        ))}
                    </select>

                    <label>Dvorana</label>
                    <select
                        name="room_id"
                        value={addForm.room_id}
                        onChange={handleAddChange}
                        required
                    >
                        <option value="">Izberi dvorano...</option>
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>

                    <div style={styles.row}>
                        <div style={styles.half}>
                            <label>Čas začetka</label>
                            <input
                                type="datetime-local"
                                name="start_time"
                                value={addForm.start_time}
                                onChange={handleAddChange}
                                required
                            />
                        </div>
                        <div style={styles.half}>
                            <label>Čas konca</label>
                            <input
                                type="datetime-local"
                                name="end_time"
                                value={addForm.end_time}
                                onChange={handleAddChange}
                                required
                            />
                        </div>
                    </div>

                    <label>Cena vstopnice (€)</label>
                    <input
                        type="number"
                        name="price"
                        value={addForm.price}
                        onChange={handleAddChange}
                        placeholder="9.99"
                        step="0.01"
                        min="0"
                        required
                    />

                    <button type="submit" className="btn btn-primary">
                        Dodaj predvajanje
                    </button>
                </form>
            </div>

            {/* ── lista predstav ── */}
            <h2 style={styles.sectionTitle}>Prihajajoča predvajanja</h2>
            {screenings.length === 0 ? (
                <p style={{ color: '#aaa' }}>Ni prihajajočih predvajanj..</p>
            ) : (
                screenings.map(s => (
                    <div key={s.id} className="card" style={{ marginBottom: '12px' }}>

                        {/* ── Uredi obrazec (prikazano v vrstici med urejanjem) ── */}
                        {editingId === s.id ? (
                            <form onSubmit={handleEditSubmit}>
                                <h3 style={{ marginBottom: '16px', color: '#e50914' }}>
                                    ✏️ Urejanje: {s.film_title}
                                </h3>

                                <label>Film</label>
                                <select
                                    name="film_id"
                                    value={editForm.film_id}
                                    onChange={handleEditChange}
                                    required
                                >
                                    <option value="">Izberi film...</option>
                                    {films.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.title}
                                        </option>
                                    ))}
                                </select>

                                <label>Dvorana</label>
                                <select
                                    name="room_id"
                                    value={editForm.room_id}
                                    onChange={handleEditChange}
                                    required
                                >
                                    <option value="">Izberi dvorano...</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>

                                <div style={styles.row}>
                                    <div style={styles.half}>
                                        <label>Čas začetka</label>
                                        <input
                                            type="datetime-local"
                                            name="start_time"
                                            value={editForm.start_time}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>
                                    <div style={styles.half}>
                                        <label>Čas konca</label>
                                        <input
                                            type="datetime-local"
                                            name="end_time"
                                            value={editForm.end_time}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <label>Cena vstopnice (€)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={editForm.price}
                                    onChange={handleEditChange}
                                    step="0.01"
                                    min="0"
                                    required
                                />

                                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
    {error && (
        <div className="error">{error}</div>
    )}
    <div style={{ display: 'flex', gap: '10px' }}>
        <button
            type="submit"
            className="btn btn-primary"
        >
            Shrani spremembe
        </button>
        <button
            type="button"
            className="btn btn-secondary"
            onClick={cancelEdit}
        >
            Prekliči
        </button>
    </div>
</div>
                            </form>

                        ) : (

                            /* ── Normalna vrsta ── */
                            <div style={styles.listItem}>
                                <div>
                                    <strong>{s.film_title}</strong>
                                    <p style={styles.meta}>
                                        📅{' '}
                                        {new Date(s.start_time).toLocaleString(
                                            'sl-SI', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                                timeZone: 'UTC',
                                            }
                                        )}
                                        {' '}· 🏛️ {s.room_name}
                                        {' '}· 🎟️ €{s.price}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => startEdit(s)}
                                    >
                                        ✏️ Uredi
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        Izbriši
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

// Zavihek s filmi
const PRAZEN_FILM = {
    title: '', title_sl: '', genre: '', duration_minutes: '',
    age_rating: '', synopsis: '', director: '',
    release_year: '', poster_url: '', backdrop_url: '',
    imdb_url: '', trailer_url: '', cast_members: ''
};

function FilmsTab() {
    const [uploading, setUploading] = useState(false);
    const [posterPreview, setPosterPreview] = useState('');
    const [uploadingBackdrop, setUploadingBackdrop] = useState(false);
    const [backdropPreview, setBackdropPreview] = useState('');
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState(PRAZEN_FILM);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        getFilms()
            .then(res => setFilms(res.data))
            .catch(() => setError('Filmov ni bilo mogoče naložiti.'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

const handleBackdropUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBackdrop(true);
    try {
        const formData = new FormData();
        formData.append('poster', file);
        const response = await uploadPoster(formData);
        setForm(prev => ({ ...prev, backdrop_url: response.data.url }));
        setBackdropPreview(response.data.url);
        setSuccess('Pasica naložena!');
    } catch (_err) {
        setError('Napaka pri nalaganju pasice.');
    } finally {
        setUploadingBackdrop(false);
    }
};

const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
        const formData = new FormData();
        formData.append('poster', file);
        const response = await uploadPoster(formData);
        setForm({ ...form, poster_url: response.data.url });
        setPosterPreview(response.data.url);
        setSuccess('Plakat naložen!');
    } catch (_err) {
         setError('Napaka pri nalaganju plakata.');
    } finally {
        setUploading(false);
    }
};


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (editingId) {
                await updateFilm(editingId, form);
                setSuccess('Film uspešno posodobljen!');
            } else {
                await addFilm(form);
                setSuccess('Film uspešno dodan!');
            }
            setForm(PRAZEN_FILM);
            setEditingId(null);
            setPosterPreview('');
            setBackdropPreview('');
            const response = await getFilms();
            setFilms(response.data);
        } catch (err) {
            setError(err.response?.data?.message ||
                (editingId ? 'Filma ni bilo možno posodobiti.' : 'Filma ni bilo možno dodati.'));
        }
    };

    // Napolni obrazec s podatki izbranega filma
    const handleEdit = (film) => {
        setEditingId(film.id);
        setForm({
            title: film.title || '',
            title_sl: film.title_sl || '',
            genre: film.genre || '',
            duration_minutes: film.duration_minutes || '',
            age_rating: film.age_rating || '',
            synopsis: film.synopsis || '',
            director: film.director || '',
            release_year: film.release_year || '',
            poster_url: film.poster_url || '',
            backdrop_url: film.backdrop_url || '',
            imdb_url: film.imdb_url || '',
            trailer_url: film.trailer_url || '',
            cast_members: film.cast_members || ''
        });
        setPosterPreview(film.poster_url || '');
        setBackdropPreview(film.backdrop_url || '');
        setError('');
        setSuccess('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(PRAZEN_FILM);
        setPosterPreview('');
        setBackdropPreview('');
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Izbrišete ta film?')) return;
        try {
            await deleteFilm(id);
            setFilms(films.filter(f => f.id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Filma ni bilo možno izbrisati.');
        }
    };

    if (loading) return <p style={{ color: '#aaa' }}>Nalaganje...</p>;

    return (
        <div>
            {/* Dodaj filmski obrazec */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h2 style={styles.sectionTitle}>
                    {editingId ? 'Uredi film' : 'Dodaj nov film'}
                </h2>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.row}>
                        <div style={styles.half}>
                            <label>Naslov</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Naslov filma"
                                required
                            />
                            <label>Slovensko ime filma</label>
<input
    name="title_sl"
    value={form.title_sl}
    onChange={handleChange}
    placeholder="Npr. Temni vitez"
/>
                        </div>
                        <div style={styles.half}>
                            <label>Žanr</label>
                            <input
                                name="genre"
                                value={form.genre}
                                onChange={handleChange}
                                placeholder="npr. Akcijski"
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.half}>
                            <label>Trajanje (minut)</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                value={form.duration_minutes}
                                onChange={handleChange}
                                placeholder="120"
                                required
                            />
                        </div>
                        <div style={styles.half}>
                            <label>Starostna omejitev</label>
                            <select
                                name="age_rating"
                                value={form.age_rating}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Izberi...</option>
                                <option value="0-12">Za vse</option>
                                <option value="12+">12+</option>
                                <option value="15+">15+</option>
                                <option value="18+">18+</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.half}>
                            <label>Režiser</label>
                            <input
                                name="director"
                                value={form.director}
                                onChange={handleChange}
                                placeholder="ime režiserja"
                            />
                        </div>
                        <div style={styles.half}>
                            <label>Leto izida</label>
                            <input
                                type="number"
                                name="release_year"
                                value={form.release_year}
                                onChange={handleChange}
                                placeholder="2026"
                            />
                        </div>
                    </div>

                    <label>Povzetek</label>
                    <textarea
                        name="synopsis"
                        value={form.synopsis}
                        onChange={handleChange}
                        placeholder="Kratek opis filma..."
                        rows={3}
                    />
                    <label>IMDB povezava</label>
<input
    name="imdb_url"
    value={form.imdb_url}
    onChange={handleChange}
    placeholder="https://www.imdb.com/title/tt1375666/"
/>

<label>YouTube trailer povezava</label>
<input
    name="trailer_url"
    value={form.trailer_url}
    onChange={handleChange}
    placeholder="https://www.youtube.com/watch?v=..."
/>

<label>Glavne vloge</label>
<input
    name="cast_members"
    value={form.cast_members}
    onChange={handleChange}
    placeholder="Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page"
/>

                    <label>Slika plakata</label>
<input
    type="file"
    accept="image/*"
    onChange={handlePosterUpload}
    disabled={uploading}
    style={{ marginBottom: '8px' }}
/>
{uploading && <p style={{ color: '#aaa', fontSize: '13px' }}>
    Nalaganje...
</p>}
{posterPreview && (
    <img
        src={posterPreview}
        alt="Predogled plakata"
        style={{
            width: '120px',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '6px',
            marginBottom: '12px'
        }}
    />
)}

<label>Slika pasice (širokoformatna, za naslovnico)</label>
<input
    type="file"
    accept="image/*"
    onChange={handleBackdropUpload}
    disabled={uploadingBackdrop}
    style={{ marginBottom: '8px' }}
/>
{uploadingBackdrop && <p style={{ color: '#aaa', fontSize: '13px' }}>
    Nalaganje...
</p>}
{backdropPreview && (
    <img
        src={backdropPreview}
        alt="Predogled pasice"
        style={{
            width: '260px',
            height: '146px',
            objectFit: 'cover',
            borderRadius: '6px',
            marginBottom: '12px'
        }}
    />
)}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn btn-primary">
                            {editingId ? 'Shrani spremembe' : 'Dodaj film'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCancelEdit}
                            >
                                Prekliči
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* lista filmov */}
            <h2 style={styles.sectionTitle}>Vsi filmi</h2>
            {films.map(film => (
                <div key={film.id} className="card" style={styles.listItem}>
                    <div>
                        <strong>{film.title}</strong>
                        <p style={styles.meta}>
                            {film.genre} · {film.duration_minutes} min ·{' '}
                            {film.age_rating} · {film.release_year}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleEdit(film)}
                        >
                            Uredi
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(film.id)}
                        >
                            Izbriši
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// zavihek dvoran
function RoomsTab() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ name: '', capacity: '' });
    const [editingId, setEditingId] = useState(null);

    const nalozi = () => {
        getRooms()
            .then(res => setRooms(res.data))
            .catch(() => setError('Dvoran ni bilo možno naložiti.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { nalozi(); }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (editingId) {
                await updateRoom(editingId, form);
                setSuccess('Dvorana posodobljena!');
            } else {
                await addRoom(form);
                setSuccess('Dvorana dodana!');
            }
            setForm({ name: '', capacity: '' });
            setEditingId(null);
            nalozi();
        } catch (err) {
            setError(err.response?.data?.message ||
                (editingId ? 'Dvorane ni bilo možno posodobiti.' : 'Dvorane ni bilo možno dodati.'));
        }
    };

    const handleEdit = (room) => {
        setEditingId(room.id);
        setForm({ name: room.name, capacity: room.capacity });
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ name: '', capacity: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ste prepričani, da želite izbrisati to dvorano?')) return;
        try {
            await deleteRoom(id);
            nalozi();
        } catch (err) {
            setError(err.response?.data?.message || 'Dvorane ni bilo možno izbrisati.');
        }
    };

    if (loading) return <p style={{ color: '#aaa' }}>Nalagam...</p>;

    return (
        <div>
            <h2 style={styles.sectionTitle}>
                {editingId ? 'Uredi dvorano' : 'Dodaj novo dvorano'}
            </h2>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '30px' }}>
                <div style={styles.row}>
                    <div style={styles.half}>
                        <label>Ime dvorane</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={styles.half}>
                        <label>Število sedežev</label>
                        <input
                            name="capacity"
                            type="number"
                            value={form.capacity}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="submit" className="btn btn-primary">
                        {editingId ? 'Shrani spremembe' : 'Dodaj dvorano'}
                    </button>
                    {editingId && (
                        <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                            Prekliči
                        </button>
                    )}
                </div>
            </form>

            <h2 style={styles.sectionTitle}>Seznam dvoran ({rooms.length})</h2>
            {rooms.map(r => (
                <div key={r.id} className="card" style={styles.listItem}>
                    <div>
                        <strong>{r.name}</strong>
                        <p style={styles.meta}>💺 {r.capacity} sedežev</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" onClick={() => handleEdit(r)}>
                            Uredi
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(r.id)}>
                            Izbriši
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// zavihek rezervacij
function ReservationsTab() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getAllReservations()
            .then(res => setReservations(res.data))
            .catch(() => setError('Rezervacij ni bilo možno naložiti.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ color: '#aaa' }}>Nalagam...</p>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div>
            <h2 style={styles.sectionTitle}>
                Vse rezervacije ({reservations.length})
            </h2>

            {reservations.length === 0 ? (
                <p style={{ color: '#aaa' }}>Še ni rezervacij.</p>
            ) : (
                reservations.map(r => (
                    <div key={r.id} className="card" style={styles.listItem}>
                        <div>
                            <strong>{r.film_title}</strong>
                            <p style={styles.meta}>
                                👤 {r.first_name} {r.last_name} · {r.email}
                            </p>
                            <p style={styles.meta}>
                                📅{' '}
                                {new Date(r.start_time).toLocaleString('sl-SI', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                    timeZone: 'UTC',
                                })}
                                {' '}· 🏛️ {r.room_name}
                            </p>
                            <p style={styles.meta}>
                                💺 {r.seats} · 💰 {r.total_price} €
                            </p>
                        </div>
                        <span style={{
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: r.status === 'confirmed'
                                ? '#2ecc71'
                                : r.status === 'canceled'
                                ? '#e74c3c'
                                : '#f39c12'
                        }}>
                            {r.status.toUpperCase()}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
}

// zavihek z uporabniki
function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getUsers()
            .then(res => setUsers(res.data))
            .catch(() => setError('Uporabnikov ni bilo mogoče naložiti.'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Izbrišete tega uporabnika? Izbrisane bodo tudi vse njegove rezervacije.')) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Uporabnika ni bilo možno izbrisati.');
        }
    };

    if (loading) return <p style={{ color: '#aaa' }}>Nalaganje...</p>;

    return (
        <div>
            {error && <div className="error">{error}</div>}
            {users.map(u => (
                <div
                    key={u.id}
                    className="card"
                    style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div>
                        <strong>{u.first_name} {u.last_name}</strong>{' '}
                        ({u.role === 'admin' ? 'skrbnik' : 'stranka'})
                        <div style={{ fontSize: '13px', color: '#aaa' }}>{u.email}</div>
                    </div>
                    <button className="btn btn-danger" onClick={() => handleDelete(u.id)}>
                        Izbriši
                    </button>
                </div>
            ))}
        </div>
    );
}

const styles = {
    title: { fontSize: '32px', marginBottom: '24px' },
    sectionTitle: { fontSize: '20px', marginBottom: '16px' },
    tabBar: { display: 'flex', gap: '10px', marginBottom: '30px' },
    tabBtn: { color: 'white', textTransform: 'capitalize' },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
    },
    meta: { color: '#aaa', fontSize: '13px', marginTop: '4px' },
    row: { display: 'flex', gap: '12px' },
    half: { flex: 1 },
};

export default Admin;