// This is nasty, but prevents requiring different commands
// for windows machines
process.env.DEBUG = '-*';
require('dotenv').config({ path: `${__dirname}/.env` });
