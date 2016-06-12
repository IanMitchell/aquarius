const triggers = require('../util/triggers');
const Command = require('../core/command');

const URL = 'https://playoverwatch.com/en-us/career/pc/us/';

class Overwatch extends Command {
  message(msg) {
    const profile = triggers.messageTriggered(msg, /^overwatch ([\w]+#[\d]{4,5})$/i);
    if (profile) {
      this.log(`Overwatch called for ${profile[1]}`);
      return URL + profile[1].replace('#', '-');
    }

    return false;
  }

  helpMessage() {
    return '`@bot overwatch [b.net tag]`. Links to Overwatch career overview for the profile.';
  }
}

module.exports = new Overwatch();
