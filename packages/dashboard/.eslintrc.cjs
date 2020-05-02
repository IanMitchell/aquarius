module.exports = {
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'react/jsx-filename-extension': 0,
    'react/jsx-fragments': [1, 'element'],
    'react/jsx-one-expression-per-line': 0,
  },
};
