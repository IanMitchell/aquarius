// This is nasty, but prevents requiring different commands
// for windows machines
process.env.DEBUG = '-*';
process.env.DASHBOARD = 'disabled';
process.env.NODE_ENV = 'test';

require('dotenv').config({
  path: `${__dirname}/.env`,
  silent: true,
});
