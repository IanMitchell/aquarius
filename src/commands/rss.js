const Aquarius = require('../aquarius');
const parser = require('parse-rss');

const FREQUENCY = 1000 * 60 * 5;
const CHANNEL_MESSAGE_HISTORY_LIMIT = 50;

class RSS extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Posts to a channel with new RSS entries. If the URL has not been posted in the past 50 channel messages, it is considered new.';
    this.settings.addKey('channel', null, 'Where to post RSS alerts (no #)');
    this.settings.addKey('url', null, 'Link to RSS Feed');

    setInterval(this.loop.bind(this), FREQUENCY);
  }

  loop() {
    Aquarius.Client.guilds.array().forEach(guild => {
      if (Aquarius.Permissions.isCommandEnabled(guild, this)) {
        this.checkForUpdates(guild);
      }
    });
  }

  // TODO: Move to Database?
  checkLink(channel, url) {
    return channel.fetchMessages({ limit: CHANNEL_MESSAGE_HISTORY_LIMIT }).then(messages => {
      const result = messages.array().some(message => message.content.includes(url));
      return result;
    }).catch(err => {
      this.log(err);
      return false;
    });
  }

  checkForUpdates(guild) {
    const url = this.getSetting(guild.id, 'url');
    const target = this.getSetting(guild.id, 'channel');
    const channel = guild.channels.array().find(c => c.name === target) || guild.defaultChannel;

    if (!url) {
      const admin = guild.owner.user;
      this.log(`Alerting ${admin.name} to configure RSS command.`);
      channel.sendMessage(`${admin}: Please set a url for the RSS command. Query me with \`help rss\`.`);
      return;
    }

    parser(url, (err, rss) => {
      if (err) {
        this.log(err);
        channel.sendMessage(`Error parsing RSS feed: ${url}`);
        return;
      }

      rss.reverse().forEach(entry => {
        this.checkLink(channel, entry.link).then(posted => {
          if (!posted) {
            this.log(`Posting ${entry.title} to ${guild.name}`);
            let str = `📰 **${entry.title}**\n`;
            str += '\n';
            str += `${entry.link}`;
            channel.sendMessage(str);
          }
        });
      });
    });
  }
}

module.exports = new RSS();
