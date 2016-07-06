// This is nasty, but prevents requiring different commands
// for windows machines
process.env.DEBUG = '-*';

// Hacky check for dev/CI startup
const fs = require('fs');

try {
  fs.statSync(`${__dirname}/.env`);
  require('dotenv').config({ path: `${__dirname}/.env` });
} catch (e) {
  console.log('CI Build, reading from environment.');
}
