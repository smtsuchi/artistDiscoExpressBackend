module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: ['eslint:recommended', 'prettier'],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    plugins: ['node'],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'node/no-unsupported-features/es-syntax': 'off',
        'prefer-const': 'error',
        'no-var': 'error'
    }
};
