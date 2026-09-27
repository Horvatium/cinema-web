# KinoPlex – spletna aplikacija

[![CI](https://github.com/Horvatium/cinema-web/actions/workflows/ci.yml/badge.svg)](https://github.com/Horvatium/cinema-web/actions/workflows/ci.yml)

Spletna aplikacija v Reactu za **KinoPlex**, sistem za rezervacijo kinovstopnic. Stranke
pregledujejo spored, izberejo sedeže na interaktivnem zemljevidu dvorane in vstopnice plačajo
prek Stripa. Skrbniki upravljajo filme, predvajanja, dvorane in rezervacije. Projekt je nastal
kot diplomska naloga in deluje v produkciji.

**Spletna stran:** [kinoplex.si](https://www.kinoplex.si) ·
**API:** [cinema-api](https://github.com/Horvatium/cinema-api) ·
**Mobilna aplikacija:** [cinema-mobile](https://github.com/Horvatium/cinema-mobile) ·
[English version](README.en.md)

![Domača stran](docs/screenshots/home.png)

| Spored                                            | Izbira sedežev                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| ![Spored po dnevih](docs/screenshots/program.png) | ![Zemljevid z dvema izbranima sedežema](docs/screenshots/seats.png) |

## Funkcionalnosti

- Spored po dnevih z iskanjem
- Podrobnosti filma: opis, igralska zasedba, režiser, povezava na IMDb in napovednik
- Interaktivni zemljevid dvorane s prostimi, izbranimi in zasedenimi sedeži
- Spletno plačilo s Stripe Elements. Med plačevanjem so sedeži zadržani 10 minut, zadržanje
  pa preživi tudi osvežitev strani.
- Registracija s potrditvijo e-poštnega naslova; seja v piškotku httpOnly, ki ga JavaScript ne more
  prebrati (žetona ni v `localStorage`)
- »Moje vstopnice«: pregled in preklic lastnih rezervacij
- Skrbniška plošča: filmi (z nalaganjem plakatov), predvajanja, dvorane in vse rezervacije

Logika rezervacij, vključno z zaščito pred tem, da bi dve stranki hkrati kupili isti sedež, je
v API-ju. Glej [README za cinema-api](https://github.com/Horvatium/cinema-api#napaka-z-dvojno-rezervacijo).

## Tehnologije

| Področje            | Tehnologija                                 |
| ------------------- | ------------------------------------------- |
| Uporabniški vmesnik | React 19, React Router 7                    |
| Odjemalec za API    | Axios s piškotkom seje (`withCredentials`)  |
| Plačila             | Stripe Elements (`@stripe/react-stripe-js`) |
| Gradnja             | Vite                                        |
| Orodja              | ESLint, Prettier, Vitest in Testing Library |
| Infrastruktura      | Docker (nginx), GitHub Actions, Vercel      |

## Zagon

Potrebuješ Node.js 22 in zagnan [cinema-api](https://github.com/Horvatium/cinema-api).
Lokalni API z demo podatki najlažje zaženeš z njegovo nastavitvijo za Docker Compose.

```bash
git clone https://github.com/Horvatium/cinema-web.git
cd cinema-web
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm run dev
```

Aplikacija teče na <http://localhost:3000>. Brez `VITE_API_URL` uporablja produkcijski
API na `https://api.kinoplex.si`.

Na Vercelovih predogledih (`*.vercel.app`) prijava ne deluje: predogled ni na istem mestu kot
`api.kinoplex.si`, zato brskalnik piškotka seje ne pošlje. Prijavo preveri lokalno ali na
kinoplex.si.

Z lokalnim API-jem in podatki iz seeda se lahko prijaviš kot `admin@kinoplex.test` /
`Admin123!` (skrbnik) ali `demo@kinoplex.test` / `Demo123!` (stranka). Računa obstajata samo
v lokalni bazi s seed podatki.

### Docker

Slika zgradi aplikacijo in jo streže z nginx. Naslov API-ja se vpiše ob gradnji.

```bash
docker build --build-arg VITE_API_URL=http://localhost:5000/api -t cinema-web .
docker run -p 3000:80 cinema-web
```

Ukaz `docker compose --profile web up` v repozitoriju API-ja zgradi in zažene to aplikacijo
skupaj z API-jem in bazo.

### Testi

25 testov z Vitestom in React Testing Library pokriva prijavno stran, zaščitene poti,
upravljanje seje v `AuthContext` (obnova seje z /auth/me, odjava ob poteku seje) in izbiro sedežev na strani
filma. Odjemalec za API je v testih nadomeščen, zato testi ne potrebujejo zagnanega API-ja.

```bash
npm test
```

### Skripte

| Ukaz                              | Opis                                           |
| --------------------------------- | ---------------------------------------------- |
| `npm run dev`                     | Razvojni strežnik                              |
| `npm run build`                   | Produkcijska gradnja                           |
| `npm test` / `test:watch`         | Testi z Vitestom (enkrat / ob vsaki spremembi) |
| `npm run preview`                 | Ogled produkcijske gradnje                     |
| `npm run lint`                    | ESLint, pade ob opozorilih                     |
| `npm run format` / `format:check` | Prettier                                       |

## CI/CD

Ob vsakem pushu in pull requestu se zažene [CI workflow](.github/workflows/ci.yml): lint,
preverjanje s Prettierjem, testi, produkcijska gradnja in gradnja Docker slike.

Na Vercel se objavi **šele, ko vse to uspe**. Vercelova samodejna objava ob pushu na `main` je
izklopljena v [`vercel.json`](vercel.json), objavo pa opravi posel v workflowu z Vercel CLI.
Predogledi za druge veje delujejo kot prej.

## Načrti

- Vklop strožjih pravil ESLint za React Compiler (`react-hooks/purity`, `immutability` ...)

## Avtor

**Vid Gudič** · diplomska naloga, CPU, 2026
