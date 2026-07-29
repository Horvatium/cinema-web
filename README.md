# KinoPlex — Spletna aplikacija 🎬

Spletna aplikacija informacijskega sistema za upravljanje kinematografa s spletnim sistemom
za rezervacijo vstopnic. Projekt je bil izdelan v okviru diplomske naloge.

🌐 Povezava: [www.kinoplex.si](https://www.kinoplex.si)

## O projektu

Spletna aplikacija strankam omogoča pregledovanje filmskega sporeda, izbiro sedežev ter
spletno rezervacijo in plačilo vstopnic. Skrbnikom kinematografa omogoča upravljanje filmov,
predvajanj in pregled vseh rezervacij prek posebne skrbniške plošče.

Povezan je z zalednim sistemom [cinema-api](https://github.com/Horvatium/cinema-api), ki zagotavlja
podatke in obravnava avtentikacijo ter plačila.

## Tehnologije

- **React** — knjižnica za izgradnjo uporabniškega vmesnika
- **React Router** — usmerjanje med stranmi
- **Axios** — komunikacija z zalednim sistemom
- **Stripe** — spletno plačevanje vstopnic

## Funkcionalnosti

- Registracija in prijava uporabnikov
- Pregled filmskega sporeda in podrobnosti filmov (opis, igralci, režiser, IMDB, napovednik)
- Izbira sedežev na interaktivnem zemljevidu dvorane
- Spletno plačilo vstopnic prek sistema Stripe
- Pregled in preklic lastnih rezervacij
- Skrbniška plošča za upravljanje filmov, predvajanj in rezervacij

## Zagon projekta

```
npm install
npm start
```

Aplikacija se zažene na `http://localhost:3000`.

Za delovanje potrebuješ zagnan zaledni sistem [cinema-api](https://github.com/Horvatium/cinema-api)
in ustrezno nastavljeno spremenljivko okolja z naslovom API-ja.

## Diagrami

Diagrami sistema (EER, primeri uporabe, razredni diagram, arhitektura namestitve) so na voljo
v mapi [`docs/diagrami`](./docs/diagrami).

## Avtor

Diplomska naloga — Vid Gudič, CPU, 2026.
