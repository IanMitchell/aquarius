const fs = require('fs');

// This is nasty, but prevents requiring different commands
// for windows machines
process.env.DEBUG = '-*';

// Account for CI environments
try {
  fs.statSync(`${__dirname}/.env`);
  require('dotenv').config({ path: `${__dirname}/.env` });
} catch (e) {
  // CI Build
}
