// Nastavitev testnega okolja; Vitest to datoteko naloži pred vsakim testom
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// Testi tečejo kot v brskalniku v Sloveniji, da ujamejo kodo, ki čase
// predstav nehote pretvarja v krajevni pas (v CI je sicer UTC)
process.env.TZ = 'Europe/Ljubljana';

// Po vsakem testu počisti izrisane komponente
afterEach(() => cleanup());
