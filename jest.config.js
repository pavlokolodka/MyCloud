module.exports = {
    roots: ['<rootDir>/tests'],
    testMatch: [
        '**/*.test.(ts|js)',
        '**/*.spec.(ts|js)',
        '**/*.e2e.(ts|js)',
    ],
    transform: {
      '^.+\\.(ts)$': 'ts-jest',
    },
    testEnvironment: 'node',
  };
  