// This is nasty, but prevents requiring different commands
// for windows machines
require('dotenv').config();

process.env.DEBUG = '*,-ref,-ref:*,-superagent';

// Start the bot
require('./src/aquarius');
