export default {
    preset: 'ts-jest',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { target: 'es6' } }],
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts', 
        '!src/**/*.d.ts', 
        '!src/index.ts',
        '!src/**/index.ts',
        '!src/**/**/index.ts'
    ],
    coverageReporters: ['lcovonly', 'text', 'text-summary'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
