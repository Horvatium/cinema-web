import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Nastavitve za Vite (razvojni strežnik in gradnja) ter Vitest (testi)
export default defineConfig({
    plugins: [react()],
    server: {
        // Ista vrata kot prej (Create React App)
        port: 3000,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.js',
    },
});
