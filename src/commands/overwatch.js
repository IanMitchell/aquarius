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

  helpMessage(server) {
    let msg = super.helpMessage();
    const nickname = Aquarius.Users.getNickname(server, this.client.user);

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} overwatch [b.net tag]\`\`\``;
    return msg;
  }

  // TODO: Allow `.overwatch set Desch#1935 -> .overwatch` (db)
  message(msg) {
    const profile = Aquarius.Triggers.messageTriggered(msg, /^overwatch (?:([A-Za-z]{2}) )?([\w]+#[\d]{4,5})$/i);

    if (profile) {
      this.log(`Overwatch called for ${profile[1]}`);

      let region = REGIONS.US;

      if (profile[1] && REGIONS.hasOwnProperty(profile[1].toUpperCase())) {
        region = REGIONS[profile[1].toUpperCase()];
      }

      return `${URL}/${region}/${profile[2].replace('#', '-')}`;
    }

    return false;
  }
}

module.exports = new Overwatch();
