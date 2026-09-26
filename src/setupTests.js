// Nastavitev testnega okolja; CRA to datoteko naloži pred vsakim testom
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// React Router 7 potrebuje TextEncoder, ki ga jsdom nima
Object.assign(global, { TextEncoder, TextDecoder });
