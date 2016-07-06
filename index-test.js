// This is nasty, but prevents requiring different commands
// for windows machines
process.env.DEBUG = '-*';

// Account for CI environments
try {
  require('dotenv').config({ path: `${__dirname}/.env` });
} catch (e) {
  // Read from environmental variables
}
