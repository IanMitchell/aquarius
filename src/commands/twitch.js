const fetch = require('node-fetch');
const Aquarius = require('../aquarius');

class Twitch extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Syncs Twitch Emotes with your server';

    this.sync().then(emotes => {
      this.emotes = emotes;
    });
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} twitch add [emote]\`\`\``;
    return msg;
  }

  sync() {
    this.log('Syncing Twitch Emotes.');

    return fetch('https://twitchemotes.com/api_cache/v2/global.json').then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(json => {
      const emotes = new Map();

      const str = json.template.large;
      Object.keys(json.emotes).forEach(key => {
        emotes.set(key, str.replace('{image_id}', json.emotes[key].image_id));
      });

      this.log(`Loaded ${emotes.size} Twitch Emotes`);

      return emotes;
    });
  }

  message(msg) {
    const twitchInput = Aquarius.Triggers.messageTriggered(msg, /^twitch add (\w+)$/i);
    if (twitchInput) {
      this.log(`Add request for ${twitchInput[1]}`);

      if (!this.emotes.has(twitchInput[1])) {
        msg.channel.sendMessage('No emote found. Please check spelling (case sensitive).');
      } else {
        msg.channel.sendMessage('Emote found. Will add someday.');
        // TODO: Add Emote
      }
    }
  }
}

module.exports = new Twitch();
