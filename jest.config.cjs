module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    // what about: ts-node CLI option:
    // --prefer-ts-exts Re-order file extensions so that TypeScript imports are preferred (TS_NODE_PREFER_TS_EXTS, default: false)
    moduleNameMapper: {
        '^(\\..*)$': [
            '$1/index.ts',
            '$1.ts',
            '$1'
        ]
    },
    testMatch: ['<rootDir>/test.ts'],
}
