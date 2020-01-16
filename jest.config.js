const reporters = ['default'];

if (process.env.GITHUB_ACTIONS) {
  reporters.push('jest-github-actions-reporter');
}

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  testEnvironment: 'node',
  verbose: true,
  testLocationInResults: true,
  testPathIgnorePatterns: ['<rootDir>/packages/regex/src/regex.test.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  reporters,
};
