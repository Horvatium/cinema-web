import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScreenings } from '../services/api';

function Home() {
    const [screenings, setScreenings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchScreenings();
    }, []);

    useEffect(() => {
        let results = screenings;

        if (search) {
            results = results.filter(s =>
                s.film_title?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (genre) {
            results = results.filter(s => s.genre === genre);
        }

        setFiltered(results);
    }, [search, genre, screenings]);

    const fetchScreenings = async () => {
        try {
            const response = await getScreenings();
            const screeningData = Array.isArray(response.data) ? response.data : [];
            setScreenings(screeningData);
            setFiltered(screeningData);
        } catch (err) {
            setError('Predstav ni bilo mogoče naložiti. Ali strežnik API deluje?');
        } finally {
            setLoading(false);
        }
    };

    // Pridobi edinstvene žanre iz predstav za dropdown filter
    const genres = [...new Set(screenings.map(s => s.genre))];

    // Grupiraj predstave po naslovu filma
    const filmMap = {};
    filtered.forEach(screening => {
        if (!filmMap[screening.film_title]) {
            filmMap[screening.film_title] = {
                title: screening.film_title,
                age_rating: screening.age_rating,
                duration_minutes: screening.duration_minutes,
                poster_url: screening.poster_url,
                genre: screening.genre,
                screenings: [],
            };
        }
        filmMap[screening.film_title].screenings.push(screening);
    });

    const films = Object.values(filmMap);

    if (loading) return <div style={styles.center}>Nalagam predstave...</div>;
    if (error) return <div className="error" style={styles.center}>{error}</div>;

    return (
        <div>
            {/* Hero */}
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>🎬 Trenutno se predvaja</h1>
                <p style={styles.heroSubtitle}>
                    Rezervirajte svoje sedeže v nekaj sekundah
                </p>
            </div>

            {/* Filters */}
            <div style={styles.filters}>
                <input
                    placeholder="🔍 Išči filme..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
                <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    style={styles.select}
                >
                    <option value="">Vsi žanri</option>
                    {genres.map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </div>

            {/* Film Grid */}
            {films.length === 0 ? (
                <div style={styles.center}>
                    Ni najdenih predstav. Poskusite z drugim iskanjem!
                </div>
            ) : (
                <div className="grid">
                    {films.map(film => (
                        <div
                            key={film.title}
                            className="card"
                            style={styles.filmCard}
                            onClick={() =>
                                navigate(`/films/${film.screenings[0].id}`,
                                { state: { film } })
                            }
                        >
                            {/* Poster */}
                            <div style={styles.posterWrapper}>
                                {film.poster_url ? (
                                    <img
                                        src={film.poster_url}
                                        alt={film.title}
                                        style={styles.poster}
                                    />
                                ) : (
                                    <div style={styles.posterPlaceholder}>
                                        🎬
                                    </div>
                                )}
                                <span style={styles.rating}>
                                    {film.age_rating}
                                </span>
                            </div>

                            {/* Info */}
                            <div style={styles.filmInfo}>
                                <h3 style={styles.filmTitle}>{film.title}</h3>
                                <p style={styles.filmMeta}>
                                    {film.genre} · {film.duration_minutes} min
                                </p>

                                {/* Screening times */}
                                <div style={styles.times}>
                                    {film.screenings.map(s => (
                                        <span
                                            key={s.id}
                                            style={styles.timeChip}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/films/${s.id}`,
                                                { state: { film, screening: s } });
                                            }}
                                        >
                                            {new Date(s.start_time)
                                                .toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            }
                                        </span>
                                    ))}
                                </div>

                                <p style={styles.price}>
                                    From €{film.screenings[0].price}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    hero: {
        textAlign: 'center',
        padding: '60px 20px 40px',
        marginBottom: '10px',
    },
    heroTitle: {
        fontSize: '42px',
        marginBottom: '12px',
    },
    heroSubtitle: {
        color: '#aaa',
        fontSize: '18px',
    },
    filters: {
        display: 'flex',
        gap: '12px',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    searchInput: {
        flex: 1,
        minWidth: '200px',
        marginBottom: 0,
    },
    select: {
        width: '180px',
        marginBottom: 0,
    },
    filmCard: {
        cursor: 'pointer',
        padding: '0',
        overflow: 'hidden',
        transition: 'transform 0.2s',
    },
    posterWrapper: {
        position: 'relative',
        width: '100%',
        height: '280px',
        background: '#222',
    },
    poster: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    posterPlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '60px',
        background: '#1a1a1a',
    },
    rating: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#e50914',
        color: 'white',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    filmInfo: {
        padding: '14px',
    },
    filmTitle: {
        fontSize: '17px',
        marginBottom: '6px',
    },
    filmMeta: {
        color: '#aaa',
        fontSize: '13px',
        marginBottom: '12px',
    },
    times: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px',
    },
    timeChip: {
        background: '#e50914',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    price: {
        color: '#aaa',
        fontSize: '13px',
    },
    center: {
        textAlign: 'center',
        padding: '60px',
        color: '#aaa',
    },
};

export default Home;