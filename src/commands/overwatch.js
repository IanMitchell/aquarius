const debug = require('debug');
const triggers = require('../util/triggers');

const log = debug('Overwatch');
const URL = 'https://playoverwatch.com/en-us/career/pc/us/';

const message = msg => {
  const profile = triggers.messageTriggered(msg, /^overwatch ([\w]+#[\d]{4,5})$/i);
  if (profile) {
    log(`Overwatch called for ${profile[1]}`);
    return URL + profile[1].replace('#', '-');
  }

  return false;
};

module.exports = {
  name: 'overwatch',
  help: '`@bot overwatch [b.net tag]`. Links to Overwatch career overview for the profile.',
  message,
};
