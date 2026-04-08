import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScreenings } from '../services/api';

function Home() {
    const [screenings, setScreenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScreenings = async () => {
            try {
                const response = await getScreenings();
                const data = Array.isArray(response.data) ? response.data : [];
                setScreenings(data);
            } catch (_err) {
                setScreenings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchScreenings();
    }, []);

    // Združi predstave po filmu
    const filmMap = {};
    screenings.forEach(s => {
        if (!filmMap[s.film_title]) {
            filmMap[s.film_title] = {
                title: s.film_title,
                genre: s.genre,
                duration_minutes: s.duration_minutes,
                age_rating: s.age_rating,
                poster_url: s.poster_url,
                backdrop_url: s.backdrop_url,
                synopsis: s.synopsis,
                screenings: [],
            };
        }
        filmMap[s.film_title].screenings.push(s);
    });
    const films = Object.values(filmMap);

    // Hero samodejno preklapljanje vsakih 5 sekund
    useEffect(() => {
        if (films.length <= 1) return;
        const interval = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % films.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [films.length]);

    const featuredFilm = films[heroIndex];

    return (
        <div style={styles.page}>
            {/* ── Hero baner ── */}
{!loading && featuredFilm && (
    <div style={{
    ...styles.hero,
    backgroundImage: featuredFilm.backdrop_url
        ? `url(${featuredFilm.backdrop_url})`
        : featuredFilm.poster_url
        ? `url(${featuredFilm.poster_url})`
        : 'none',
}}>
        <div style={styles.heroOverlay}>
            <div style={styles.heroContent}>
                <span className="genre-tag">{featuredFilm.genre}</span>
                <h1 style={styles.heroTitle}>{featuredFilm.title}</h1>
                <p style={styles.heroMeta}>
                    {featuredFilm.duration_minutes} min
                    {'  ·  '}
                    {featuredFilm.age_rating}
                </p>
                {featuredFilm.synopsis && (
                    <p style={styles.heroSynopsis}>
                        {featuredFilm.synopsis.length > 160
                            ? featuredFilm.synopsis.substring(0, 160) + '...'
                            : featuredFilm.synopsis
                        }
                    </p>
                )}
                <button
                    className="btn btn-primary"
                    style={styles.heroBtn}
                    onClick={() => navigate(
                        `/films/${featuredFilm.screenings[0].id}`,
                        { state: {
                            film: featuredFilm,
                            screening: featuredFilm.screenings[0]
                        }}
                    )}
                >
                    → Rezerviraj vstopnice
                </button>
            </div>
        </div>

        {/* pike */}
        <div style={styles.heroDots}>
            {films.map((_, i) => (
                <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    style={{
                        ...styles.heroDot,
                        ...(i === heroIndex ? styles.heroDotActive : {})
                    }}
                />
            ))}
        </div>

        {/* nazaj / naprej puščice */}
        <button
            style={{...styles.heroArrow, left: '20px'}}
            onClick={() => setHeroIndex(
                prev => (prev - 1 + films.length) % films.length
            )}
        >
            ‹
        </button>
        <button
            style={{...styles.heroArrow, right: '20px'}}
            onClick={() => setHeroIndex(
                prev => (prev + 1) % films.length
            )}
        >
            ›
        </button>
    </div>
)}

            <div className="container">
                {/* ── V kinu poster  ── */}
                {!loading && films.length > 0 && (
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.sectionLabel}>
                                V KINODVORANAH
                            </span>
                        </div>
                        <div style={styles.posterStrip}>
                            {films.map(film => (
                                <div
                                    key={film.title}
                                    style={styles.posterCard}
                                    onClick={() => navigate(
                                        `/films/${film.screenings[0].id}`,
                                        { state: {
                                            film,
                                            screening: film.screenings[0]
                                        }}
                                    )}
                                >
                                    {film.poster_url ? (
                                        <img
                                            src={film.poster_url}
                                            alt={film.title}
                                            style={styles.posterImg}
                                        />
                                    ) : (
                                        <div style={styles.posterPlaceholder}>
                                            🎬
                                        </div>
                                    )}
                                    <div style={styles.posterOverlay}>
                                        <p style={styles.posterTitle}>
                                            {film.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Predogled programa ── */}
                {!loading && films.length > 0 && (
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.sectionLabel}>
                                DANAŠNJI PROGRAM
                            </span>
                            <button
                                className="btn btn-secondary"
                                style={{ fontSize: '13px', padding: '8px 16px' }}
                                onClick={() => navigate('/program')}
                            >
                                Celoten program →
                            </button>
                        </div>

                        {films.slice(0, 4).map(film => (
                            <div
                                key={film.title}
                                style={styles.programRow}
                                onClick={() => navigate(
                                    `/films/${film.screenings[0].id}`,
                                    { state: {
                                        film,
                                        screening: film.screenings[0]
                                    }}
                                )}
                            >
                                {/* Sličica */}
                                <div style={styles.programThumb}>
                                    {film.poster_url ? (
                                        <img
                                            src={film.poster_url}
                                            alt={film.title}
                                            style={styles.programThumbImg}
                                        />
                                    ) : (
                                        <div style={styles.programThumbPlaceholder}>
                                            🎬
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={styles.programInfo}>
                                    <div style={styles.programTags}>
                                        <span className="genre-tag">
                                            {film.genre}
                                        </span>
                                        <span className="genre-tag"
                                            style={styles.ratingTag}>
                                            {film.age_rating}
                                        </span>
                                    </div>
                                    <h3 style={styles.programTitle}>
                                        {film.title}
                                    </h3>
                                    <p style={styles.programMeta}>
                                        {film.duration_minutes} minut
                                    </p>

                                    {/* Časi predvajanja */}
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
                                                {new Date(s.start_time)
                                                    .toLocaleTimeString('sl-SI', {
                                                     hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                    })
                                                }
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cena */}
                                <div style={styles.programPrice}>
                                    <span style={styles.priceLabel}>od</span>
                                    <span style={styles.priceValue}>
                                        €{film.screenings[0].price}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {films.length > 4 && (
                            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/program')}
                                >
                                    Prikaži vseh {films.length} filmov
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div style={styles.center}>
                        <div style={styles.loader}></div>
                        <p style={{ color: '#555', marginTop: '16px' }}>
                            Nalaganje programa...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh' },
    hero: {
        height: '520px',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        position: 'relative',
        backgroundColor: '#1a0a3e',
        transition: 'background-image 0.5s ease-in-out',
    },
    heroOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(8,11,26,0.95) 35%, rgba(8,11,26,0.3) 100%)',
        display: 'flex',
        alignItems: 'center',
    },
    heroContent: {
        padding: '0 60px',
        maxWidth: '520px',
    },
    heroTitle: {
        fontSize: '42px',
        fontWeight: '700',
        lineHeight: 1.15,
        marginBottom: '12px',
        marginTop: '10px',
        letterSpacing: '-0.5px',
    },
    heroMeta: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '15px',
        marginBottom: '24px',
    },
    heroBtn: {
        padding: '13px 28px',
        fontSize: '15px',
    },
    section: { marginBottom: '48px', paddingTop: '32px' },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    sectionLabel: {
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '2px',
        color: '#00c9b1',
        textTransform: 'uppercase',
    },
    posterStrip: {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '12px',
        scrollbarWidth: 'none',
    },
    posterCard: {
        flexShrink: 0,
        width: '130px',
        height: '195px',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s',
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
        fontSize: '36px',
        background: '#1a1a2e',
    },
    posterOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        padding: '20px 8px 8px',
    },
    posterTitle: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#fff',
        lineHeight: 1.3,
    },
    programRow: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '10px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    programThumb: {
        flexShrink: 0,
        width: '100px',
        height: '140px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#1a1a2e',
    },
    programThumbImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    programThumbPlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
    },
    programInfo: { flex: 1 },
    programTags: { marginBottom: '8px' },
    ratingTag: {
        background: 'rgba(123,97,255,0.15)',
        color: '#7b61ff',
        border: '1px solid rgba(123,97,255,0.3)',
    },
    programTitle: {
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '6px',
        letterSpacing: '-0.3px',
    },
    programMeta: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '13px',
        marginBottom: '14px',
    },
    timesRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    timeChip: {
        background: 'rgba(0,201,177,0.12)',
        color: '#00c9b1',
        border: '1px solid rgba(0,201,177,0.3)',
        borderRadius: '6px',
        padding: '6px 14px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'Inter, sans-serif',
    },
    programPrice: {
        flexShrink: 0,
        textAlign: 'right',
        paddingRight: '8px',
    },
    priceLabel: {
        display: 'block',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '11px',
        marginBottom: '2px',
    },
    priceValue: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#fff',
    },
    center: { textAlign: 'center', padding: '80px 20px' },
    loader: {
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #00c9b1',
        borderRadius: '50%',
        margin: '0 auto',
        animation: 'spin 0.8s linear infinite',
    },
    heroSynopsis: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '24px',
    maxWidth: '460px',
},
heroDots: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
},
heroDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.2s',
},
heroDotActive: {
    background: '#00c9b1',
    width: '24px',
    borderRadius: '4px',
},
heroArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
},
};

export default Home;