// This is nasty, but prevents requiring different commands
// for windows machines
process.env.DEBUG = '*,-ref,-ref:*,-superagent';

const fs = require('fs');
const debug = require('debug');
const log = debug('Boot');

// Hacky check for dev/production startup
try {
  fs.statSync('.env');

  log('Development environment, reading from `.env`');
  require('dotenv').config();
} catch (e) {
  log('Production environment, reading from environmental variables');
}

// Start the bot
require('./src/aquarius');
