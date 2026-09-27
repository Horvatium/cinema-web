// Nastavitev testnega okolja; Vitest to datoteko naloži pred vsakim testom
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// Po vsakem testu počisti izrisane komponente
afterEach(() => cleanup());
