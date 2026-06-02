import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScreenings } from '../services/api';

// Pomanjšaj TMDB slike za hitrejše nalaganje
const optimizeImg = (url, width) => {
    if (!url) return url;
    return url.replace('/original/', `/w${width}/`);
};

function Home() {
    const [screenings, setScreenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScreenings = async () => {
            try {
                const response = await getScreenings();
                const screeningData = Array.isArray(response.data)
                    ? response.data : [];
                setScreenings(screeningData);
            } catch (_err) {
                setScreenings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchScreenings();
    }, []);

    const filmMap = {};
    screenings.forEach(s => {
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
            
            {/* ── Hero pasica ── */}
                {!loading && featuredFilm && (
                <div style={{
                    ...styles.hero,
                    backgroundImage: featuredFilm.backdrop_url
    ? `url(${optimizeImg(featuredFilm.backdrop_url, 1280)})`
    : featuredFilm.poster_url
    ? `url(${optimizeImg(featuredFilm.poster_url, 780)})`
    : 'none',
                }}>
                    <div style={styles.heroOverlay}>
                        <div style={styles.heroContent}>
                            <span className="genre-tag">
                                {featuredFilm.genre}
                            </span>
                            <h1 style={styles.heroTitle}>
                                {featuredFilm.title_sl || featuredFilm.title}
                            </h1>
                            <p style={styles.heroMeta}>
                                {featuredFilm.duration_minutes} min
                                {'  ·  '}
                                {featuredFilm.age_rating}
                            </p>
                            {featuredFilm.synopsis && (
                                <p style={styles.heroSynopsis}>
                                    {featuredFilm.synopsis.length > 160
                                        ? featuredFilm.synopsis
                                            .substring(0, 160) + '...'
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

                    {/* Dots */}
                    <div style={styles.heroDots}>
                        {films.map((_, i) => (
                            <button
    key={i}
    onClick={() => setHeroIndex(i)}
    style={{
        ...styles.heroDot,
        ...(i === heroIndex ? styles.heroDotActive : {})
    }}
    aria-label={`Film ${i + 1}`}
/>
                        ))}
                    </div>

                    {/* Puščice */}
                    <button
    style={{...styles.heroArrow, left: '20px'}}
    onClick={() => setHeroIndex(
        prev => (prev - 1 + films.length) % films.length
    )}
    aria-label="Prejšnji film"
>{'<'}</button>
<button
    style={{...styles.heroArrow, right: '20px'}}
    onClick={() => setHeroIndex(
        prev => (prev + 1) % films.length
    )}
    aria-label="Naslednji film"
>{'>'}</button>
                </div>
            )}

            <div className="container">

                {/* ── Poster trak ── */}
                {!loading && films.length > 0 && (
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.sectionLabel}>
                                V KINODVORANAH
                            </span>
                        </div>
                        <div style={styles.posterStrip}>
                            {films.map((film, index) => (
    <div
        key={film.title}
        style={styles.posterCard}
        onMouseEnter={() => setHeroIndex(index)}
        onClick={() => navigate(
            `/films/${film.screenings[0].id}`,
            { state: { film, screening: film.screenings[0] }}
        )}
    >
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
                                    <div style={styles.posterOverlay}>
                                        <p style={styles.posterTitle}>
                                            {film.title_sl || film.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Paralax slika */}
<div style={styles.parallaxSection}>
    <div style={styles.parallaxOverlay}>
        <h2 style={styles.parallaxText}>
            Doživetje, ki ga ne boste pozabili
        </h2>
        <p style={styles.parallaxSubtext}>
            Rezervirajte svoje sedeže že danes
        </p>
    </div>
</div>
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
                                <div style={styles.programThumb}>
                                    {film.poster_url ? (
                                        <img
    src={optimizeImg(film.poster_url, 342)}
    alt={film.title_sl || film.title}
    style={styles.programThumbImg}
    width={100}
    height={140}
    loading="lazy"
/>
                                    ) : (
                                        <div style={styles.programThumbPlaceholder}>
                                            🎬
                                        </div>
                                    )}
                                </div>

                                <div style={styles.programInfo}>
                                    <div style={styles.programTags}>
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
                                    <h3 style={styles.programTitle}>
                                        {film.title_sl || film.title}
                                    </h3>
                                    <p style={styles.programMeta}>
                                        {film.duration_minutes} minut
                                    </p>
                                    <div style={styles.timesRow}>
                                        {film.screenings.map(s => (
                                            <button
                                                key={s.id}
                                                style={styles.timeChip}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(
                                                        `/films/${s.id}`,
                                                        { state: {
                                                            film,
                                                            screening: s
                                                        }}
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

{/* ── Promo baner aplikacije ── */}
{!loading && (
    <div style={styles.promoBanner}>
        <div style={styles.promoImgWrapper}>
            <img
                src="https://cineamo-cdn.b-cdn.net/images/pictures/im-smartphoneWithCineamoAppAndPopcornBackground.png?width=1080"
                alt="KinoPlex mobilna aplikacija"
                style={styles.promoImg}
            />
            <div style={styles.promoImgFade} />
        </div>
        <div style={styles.promoContent}>
             <h3 style={styles.promoTitle}>
                                Kino v vaših rokah - z aplikacijo KinoPlex 
                            </h3>
            <p style={styles.promoText}>
                Odkrijte vse, kar ponuja vaš kino. Z aplikacijo KinoPlex
                ne morete le rezervirati kina, temveč tudi odkriti
                trenutni program in nove dogodke v kinu. Najdete jo zdaj
                v trgovini z aplikacijami!
            </p>
            <div style={styles.promoButtons}>
                {/*<button
                    className="btn btn-secondary"
                    style={{ padding: 0, background: 'none', border: 'none' }}
                    onClick={() => window.open('https://apps.apple.com', '_blank')}
                >
                    <img
                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                        alt="App Store"
                        style={styles.storeBadge}
                    />
                </button>*/}
                <button
    style={{ padding: 0, background: 'none', border: 'none' }}
    onClick={() => window.open('https://play.google.com', '_blank')}
    aria-label="Prenesi na Google Play"
>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Google Play"
                        style={styles.storeBadge}
                    />
                </button>
            </div>
        </div>
    </div>
)}

                {loading && (
                    <div style={styles.center}>
                        <p style={{ color: '#555' }}>
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

    // ── Hero ──
    hero: {
    height: '520px',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    position: 'relative',
    backgroundColor: '#1a0a3e',
    transition: 'background-image 0.8s ease-in-out',
},
    heroOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(8,11,26,0.95) 35%, rgba(8,11,26,0.3) 100%)',
        display: 'flex',
        alignItems: 'center',
    },
    heroContent: { padding: '0 60px', maxWidth: '520px' },
    heroTitle: {
        fontSize: '42px',
        fontWeight: '700',
        lineHeight: 1.15,
        marginBottom: '12px',
        marginTop: '10px',
        letterSpacing: '-0.5px',
    },
    heroMeta: { color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '12px' },
    heroSynopsis: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
        lineHeight: 1.6,
        marginBottom: '24px',
        maxWidth: '460px',
    },
    heroBtn: { padding: '13px 28px', fontSize: '15px' },
    heroDots: {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
    },
    heroDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    backgroundClip: 'content-box',
},
heroDotActive: {
    background: '#00c9b1',
    width: '28px',
    borderRadius: '4px',
    padding: '8px',
    backgroundClip: 'content-box',
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
    },

    // ── Sekcije ──
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

    // ── Poster trak ──
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
        background: '#1a1a2e',
    },
    posterImg: { width: '100%', height: '100%', objectFit: 'cover' },
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
    posterTitle: { fontSize: '11px', fontWeight: '600', color: '#fff', lineHeight: 1.3 },

    // Paralax
    parallaxSection: {
    height: '300px',
    backgroundImage: 'url(https://cdn.mclcinema.com/desktopweb/about-us-banner.jpg)',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    margin: '0 -20px',
    marginBottom: '0',
},
parallaxOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(8,11,26,0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
},
parallaxText: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: '-0.5px',
},
parallaxSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
    textAlign: 'center',
},
    // ── Program vrstice ──
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
    },
    programThumb: {
        flexShrink: 0,
        width: '100px',
        height: '140px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#1a1a2e',
    },
    programThumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
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
    programTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '6px' },
    programMeta: { color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '14px' },
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
        fontFamily: 'Inter, sans-serif',
    },
    programPrice: { flexShrink: 0, textAlign: 'right', paddingRight: '8px' },
    priceLabel: { display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '2px' },
    priceValue: { fontSize: '22px', fontWeight: '700', color: '#fff' },

    // ── Promocijska pasica aplikacije ──
promoBanner: {
    display: 'flex',
    alignItems: 'stretch',
    borderRadius: '20px',
    overflow: 'hidden',
    marginTop: '48px',
    marginBottom: '48px',
    background: 'linear-gradient(135deg, #1a0a3e 0%, #0a1628 50%, #003d3d 100%)',
    minHeight: '220px',
},
promoImgWrapper: {
    position: 'relative',
    width: '380px',
    flexShrink: 0,
},
promoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
},
promoImgFade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '60%',
    background: 'linear-gradient(to right, transparent, #1a0a3e)',
},
promoContent: {
    flex: 1,
    padding: '40px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    textAlign: 'right',
},
promoTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '16px',
    letterSpacing: '-0.3px',
    color: '#fff',
},
promoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    lineHeight: 1.7,
    marginBottom: '24px',
    maxWidth: '480px',
},
promoButtons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
},
storeBadge: {
    height: '44px',
    width: 'auto',
},

    // ── Nalaganje ──
    center: { textAlign: 'center', padding: '80px 20px' },
};

export default Home;