const confusingBrowserGlobals = require('confusing-browser-globals')

module.exports = {
    parser: '@typescript-eslint/parser',

    extends: [
        'strictest/eslint',
        'strictest/promise',
        'strictest/typescript-eslint',
        'strictest/unicorn',
    ],

    plugins: ['promise', '@typescript-eslint', 'unicorn'],

    parserOptions: {
        // enables the use of `import { a } from b` syntax. required for TypeScript imports
        sourceType: 'module',

        project: './tsconfig.json',
    },

    settings: {
        react: {
            // probably can remove it in the future because docs say:
            // "it will default to "detect" in the future"
            version: 'detect',
        },
    },

    env: {
        es6: true,
        browser: true,
    },

    rules: {
        'no-restricted-globals': ['error', ...confusingBrowserGlobals],
    },
}
