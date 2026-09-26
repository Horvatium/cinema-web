import { filmFromScreening, groupByFilm } from './films';

// Vrstica, kot jo vrne GET /api/screenings
const predvajanje = (id, naslov, zacetek) => ({
    id,
    film_title: naslov,
    film_title_sl: `${naslov} (SL)`,
    genre: 'Drama',
    duration_minutes: 120,
    start_time: zacetek,
    room_name: 'Dvorana 1',
    price: '7.00',
});

describe('filmFromScreening', () => {
    it('iz vrstice predvajanja sestavi podatke o filmu', () => {
        const film = filmFromScreening(predvajanje(1, 'Arrival', '2026-10-01T18:00:00.000Z'));

        expect(film).toMatchObject({
            title: 'Arrival',
            title_sl: 'Arrival (SL)',
            genre: 'Drama',
            duration_minutes: 120,
        });
        expect(film).not.toHaveProperty('screenings');
    });
});

describe('groupByFilm', () => {
    it('združi predvajanja istega filma in ohrani njihov vrstni red', () => {
        const filmi = groupByFilm([
            predvajanje(1, 'Arrival', '2026-10-01T18:00:00.000Z'),
            predvajanje(2, 'Coco', '2026-10-01T19:00:00.000Z'),
            predvajanje(3, 'Arrival', '2026-10-02T18:00:00.000Z'),
        ]);

        expect(filmi.map((f) => f.title)).toEqual(['Arrival', 'Coco']);
        expect(filmi[0].screenings.map((s) => s.id)).toEqual([1, 3]);
        expect(filmi[1].screenings.map((s) => s.id)).toEqual([2]);
    });

    it('za prazen spored vrne prazen seznam', () => {
        expect(groupByFilm([])).toEqual([]);
    });
});
