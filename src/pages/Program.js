import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScreenings } from '../services/api';

const optimizeImg = (url, width) => {
    if (!url) return url;
    return url.replace('/original/', `/w${width}/`);
};

function Program() {
    const [screenings, setScreenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScreenings = async () => {
            try {
                const response = await getScreenings();
                const data = Array.isArray(response.data) ? response.data : [];
                setScreenings(data);
                if (data.length > 0) {
                    const firstDate = new Date(data[0].start_time)
                        .toDateString();
                    setSelectedDate(firstDate);
                }
            } catch (_err) {
                setScreenings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchScreenings();
    }, []);

    // pridobi unikatne datume
    const dates = [...new Set(
        screenings.map(s => new Date(s.start_time).toDateString())
    )].slice(0, 7);

    // Združi predstave po filmih za izbrani datum
    const filmMap = {};
    screenings
        .filter(s => new Date(s.start_time).toDateString() === selectedDate)
        .filter(s => !search || s.film_title?.toLowerCase()
            .includes(search.toLowerCase()))
        .forEach(s => {
            if (!filmMap[s.film_title]) {
                filmMap[s.film_title] = {
                     title: s.film_title,
                     title_sl: s.film_title_sl,
    genre: s.genre,
    duration_minutes: s.duration_minutes,
    age_rating: s.age_rating,
    poster_url: s.poster_url,
    backdrop_url: s.backdrop_url,
    synopsis: s.synopsis,
    director: s.director,
    release_year: s.release_year,
    cast_members: s.cast_members,
    imdb_url: s.imdb_url,
    trailer_url: s.trailer_url,
    screenings: [],
                };
            }
            filmMap[s.film_title].screenings.push(s);
        });

    const films = Object.values(filmMap);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date().toDateString();
        const tomorrow = new Date(
            Date.now() + 86400000
        ).toDateString();
        if (dateStr === today) return { day: 'Danes', date: '' };
        if (dateStr === tomorrow) return { day: 'Jutri', date: '' };
        return {
            day: d.toLocaleDateString('sl-SI', { weekday: 'short' }),
            date: d.toLocaleDateString('sl-SI', {
                day: 'numeric', month: 'short'
            })
        };
    };

    return (
        <div style={styles.page}>
            {/* ── glava ── */}
            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <h1 style={styles.headerTitle}>Program</h1>

                    {/* išči */}
                    <input
                        placeholder="🔍 Išči filme..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>

                {/* ── izbirnik datuma ── */}
                <div style={styles.dateBar}>
                    <div style={styles.dateBarInner}>
                        {dates.map(date => {
                            const { day, date: dateNum } = formatDate(date);
                            const isActive = selectedDate === date;
                            return (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    style={{
                                        ...styles.dateBtn,
                                        ...(isActive ? styles.dateBtnActive : {})
                                    }}
                                >
                                    <span style={styles.dateBtnDay}>{day}</span>
                                    {dateNum && (
                                        <span style={styles.dateBtnDate}>
                                            {dateNum}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── lista filmov ── */}
            <div className="container" style={{ paddingTop: '32px' }}>
                {loading ? (
                    <div style={styles.center}>
                        <p style={{ color: '#555' }}>Nalaganje programa...</p>
                    </div>
                ) : films.length === 0 ? (
                    <div style={styles.center}>
                        <p style={{ fontSize: '48px', marginBottom: '16px' }}>
                            🎬
                        </p>
                        <p style={{ color: '#555' }}>
                            Ni predvajanj za ta dan.
                        </p>
                    </div>
                ) : (
                    films.map(film => (
                        <div
                            key={film.title}
                            style={styles.filmRow}
                            onClick={() => navigate(
                                `/films/${film.screenings[0].id}`,
                                { state: {
                                    film,
                                    screening: film.screenings[0]
                                }}
                            )}
                        >
                            {/* Poster */}
                            <div style={styles.poster}>
                                {film.poster_url ? (
                                    <img
    src={optimizeImg(film.poster_url, 342)}
    alt={film.title_sl || film.title}
    style={styles.posterImg}
    width={130}
    height={195}
    loading="lazy"
/>
                                ) : (
                                    <div style={styles.posterPlaceholder}>
                                        🎬
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div style={styles.filmInfo}>
                                <div style={{ marginBottom: '10px' }}>
                                    <span className="genre-tag">
                                        {film.genre}
                                    </span>
                                    <span
                                        className="genre-tag"
                                        style={styles.ratingTag}
                                    >
                                        {film.age_rating}
                                    </span>
                                </div>
                                <h2 style={styles.filmTitle}>
                                    {film.title_sl || film.title}
                                    </h2>
                                    {film.title_sl && film.title_sl !== film.title && (
    <p style={styles.originalTitle}>
        {film.title}
    </p>
)}
                                <p style={styles.filmMeta}>
                                    {film.duration_minutes} min
                                </p>

                                {/* Časi predstav */}
                                <div style={styles.timesRow}>
                                    {film.screenings.map(s => (
                                        <button
                                            key={s.id}
                                            style={styles.timeChip}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(
                                                    `/films/${s.id}`,
                                                    { state: { film, screening: s }}
                                                );
                                            }}
                                        >
                                            <span style={styles.timeText}>
                                                {new Date(s.start_time)
                                                    .toLocaleTimeString('sl-SI', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                    })
                                                }
                                            </span>
                                            <span style={styles.roomText}>
                                                {s.room_name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* cena */}
                            <div style={styles.priceCol}>
                                <span style={styles.priceFrom}>od</span>
                                <span style={styles.price}>
                                    €{film.screenings[0].price}
                                </span>
                                <button
                                    className="btn btn-primary"
                                    style={styles.bookBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                            `/films/${film.screenings[0].id}`,
                                            { state: {
                                                film,
                                                screening: film.screenings[0]
                                            }}
                                        );
                                    }}
                                >
                                    Rezerviraj
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh' },
    header: {
        background: 'linear-gradient(180deg, #1a0a3e 0%, #080b1a 100%)',
        paddingTop: '32px',
    },
    headerInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
    },
    headerTitle: {
        fontSize: '32px',
        fontWeight: '700',
        letterSpacing: '-0.5px',
        flexShrink: 0,
    },
    searchInput: {
        maxWidth: '320px',
        marginBottom: 0,
    },
    dateBar: {
        borderTop: '1px solid rgba(255,255,255,0.07)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
    },
    dateBarInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        gap: '4px',
    },
    dateBtn: {
        flexShrink: 0,
        padding: '12px 20px',
        background: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
    },
    dateBtnActive: {
        color: '#00c9b1',
        borderBottom: '3px solid #00c9b1',
    },
    dateBtnDay: {
        fontSize: '14px',
        fontWeight: '600',
    },
    dateBtnDate: {
        fontSize: '11px',
        opacity: 0.7,
    },
    filmRow: {
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        padding: '20px',
        borderRadius: '14px',
        marginBottom: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    poster: {
        flexShrink: 0,
        width: '110px',
        height: '155px',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#1a1a2e',
    },
    posterImg: {
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
        fontSize: '32px',
    },
    filmInfo: { flex: 1 },
    filmTitle: {
        fontSize: '22px',
        fontWeight: '600',
        marginBottom: '6px',
        letterSpacing: '-0.3px',
    },
    originalTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '12px',
    fontStyle: 'italic',
    marginTop: '-4px',
    marginBottom: '8px',
},
    filmMeta: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '13px',
        marginBottom: '16px',
    },
    ratingTag: {
        background: 'rgba(123,97,255,0.15)',
        color: '#7b61ff',
        border: '1px solid rgba(123,97,255,0.3)',
    },
    timesRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    timeChip: {
        background: 'rgba(0,201,177,0.1)',
        color: '#00c9b1',
        border: '1px solid rgba(0,201,177,0.25)',
        borderRadius: '8px',
        padding: '8px 14px',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        transition: 'all 0.2s',
    },
    timeText: {
        fontSize: '14px',
        fontWeight: '700',
    },
    roomText: {
        fontSize: '10px',
        opacity: 0.7,
    },
    priceCol: {
        flexShrink: 0,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        paddingRight: '8px',
    },
    priceFrom: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '11px',
    },
    price: {
        fontSize: '26px',
        fontWeight: '700',
    },
    bookBtn: {
        padding: '9px 20px',
        fontSize: '13px',
        marginTop: '4px',
    },
    center: { textAlign: 'center', padding: '80px 20px' },
};

export default Program;