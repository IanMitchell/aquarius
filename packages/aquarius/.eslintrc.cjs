const { join } = require('path');

// See: https://github.com/benmosher/eslint-plugin-import/issues/1302
module.exports = {
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      // Use package.json from both this package folder and root.
      { packageDir: [__dirname, join(__dirname, '../../')] },
    ],
  },
};
