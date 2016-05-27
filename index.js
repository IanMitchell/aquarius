// This is nasty, but prevents requiring different commands
// for windows machines
process.env.DEBUG = '*,-ref,-ref:*,-superagent';

const fs = require('fs');
const debug = require('debug');
const log = debug('Boot');

// Hacky check for dev/production startup
const file = fs.statSync('.env');

if (file === null || file.code === 'ENOENT') {
  log('Production environment, reading from environmental variables');
} else {
  log('Development environment, reading from `.env`');
  require('dotenv').config();
}

// Start the bot
require('./src/aquarius');
