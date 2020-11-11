module.exports = {
    testMatch:["**/test/**/*.test.[jt]s?(x)" ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.ts',
    ],
    collectCoverage: true,
    coverageDirectory:'./coverage',
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    },
    setupFilesAfterEnv: [
        './jest.setup.js',
    ],
};
