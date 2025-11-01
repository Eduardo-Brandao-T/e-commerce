export default {
  // Trata arquivos TS como ESM
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],

  // Caminhos de import
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Estrutura de testes
  rootDir: '.',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/__tests__/**/*.ts', // pega seus arquivos __tests__
  ],

  // Cobertura
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  verbose: true,

  // Ignorar build e dependências
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
};
