// Zaledje vrne po eno vrstico na predvajanje s pripetimi podatki o filmu.
// Iz take vrstice sestavimo objekt filma, kot ga uporabljajo strani.
export const filmFromScreening = (s) => ({
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
});

// Združi predvajanja po filmih: prvi zapis določi podatke o filmu, vsi pa se
// zberejo v polju screenings
export const groupByFilm = (screenings) => {
    const filmMap = {};
    screenings.forEach((s) => {
        if (!filmMap[s.film_title]) {
            filmMap[s.film_title] = { ...filmFromScreening(s), screenings: [] };
        }
        filmMap[s.film_title].screenings.push(s);
    });
    return Object.values(filmMap);
};
