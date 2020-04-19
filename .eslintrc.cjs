module.exports = {
  env: {
    node: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],
  parser: 'babel-eslint',
  plugins: ['jest'],
  rules: {
    'no-alert': 0,
    'class-methods-use-this': 0,
    'arrow-parens': [
      0,
      'as-needed',
      {
        requireForBlockBody: false,
      },
    ],
    'import/prefer-default-export': 0,
    'import/no-cycle': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          // repos with a single test file
          'test.{cjs,js,jsx}',
          // tests where the extension denotes that it is a test
          '**/*.test.{cjs,js,jsx}',
          // config files
          '**/jest.config.{cjs,js}',
          '**/jest.setup.{cjs,js}',
        ],
        optionalDependencies: false,
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  },
};
