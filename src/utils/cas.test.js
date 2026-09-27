import { zaVnosDatumaInUre } from './cas';

describe('zaVnosDatumaInUre', () => {
    it('ohrani stenski čas predstave ne glede na časovni pas brskalnika', () => {
        // Testi tečejo v pasu Europe/Ljubljana (glej setupTests.js)
        expect(zaVnosDatumaInUre('2026-10-01T20:00:00.000Z')).toBe('2026-10-01T20:00');
        expect(zaVnosDatumaInUre('2026-01-15T20:00:00.000Z')).toBe('2026-01-15T20:00');
    });

    it('ne premakne predstave čez polnoč v naslednji dan', () => {
        expect(zaVnosDatumaInUre('2026-10-01T23:30:00.000Z')).toBe('2026-10-01T23:30');
    });

    it('za prazno vrednost vrne prazen niz', () => {
        expect(zaVnosDatumaInUre(null)).toBe('');
    });
});
