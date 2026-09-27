import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default [
    { ignores: ['dist/', 'build/', 'coverage/'] },
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.browser, ...globals.vitest },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            // Enaki pravili kot v prejšnji nastavitvi CRA; strožja pravila React
            // Compilerja (react-hooks/purity, immutability ...) zaenkrat niso vklopljena
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            // Neuporabljene spremenljivke z začetnim podčrtajem so namerne
            'no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
            ],
        },
    },
    {
        // Nastavitvene datoteke tečejo v Node
        files: ['*.config.js'],
        languageOptions: { globals: globals.node },
    },
    prettier,
];
