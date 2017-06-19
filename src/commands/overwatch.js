const Aquarius = require('../aquarius');

const REGIONS = {
  US: 'us',
  EU: 'eu',
  KR: 'kr',
};

const URL = 'https://playoverwatch.com/en-us/career/pc';

class Overwatch extends Aquarius.Command {
  constructor() {
    super();

    this.description = "Links to the Overwatch profile's career overview page";
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} overwatch [b.net tag]\`\`\``;
    return msg;
  }

  message(msg) {
    const profile = Aquarius.Triggers.messageTriggered(msg, /^overwatch (?:([A-Za-z]{2}) )?([\w]+#[\d]{4,5})$/i);

    if (profile) {
      this.log(`Overwatch called for ${profile[1]}`);

      let region = REGIONS.US;

      if (profile[1] && REGIONS.hasOwnProperty(profile[1].toUpperCase())) {
        region = REGIONS[profile[1].toUpperCase()];
      }

      msg.channel.send(`${URL}/${region}/${profile[2].replace('#', '-')}`);
    }
  }
}

module.exports = new Overwatch();
