// This is nasty, but prevents requiring different commands
// for windows machines
process.env.DEBUG = '*,-ref,-ref:*,-superagent,-retry-as-promised';
require('dotenv').config({ silent: true });
require('./src');
