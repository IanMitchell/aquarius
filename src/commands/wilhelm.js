const Aquarius = require('../aquarius');

class Wilhelm extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'This one goes out to Shaun.';

    this.settings.addKey('target', '104067232371310592', 'User ID to target');

    // Currently a bug in discord.js for <1s audio clips, so use irony for now
    this.voiceClip = `${__dirname}/../../data/wilhelm/WilhelmScream.mp3`;

    setInterval(this.voiceCheck.bind(this), this.getRandomInterval());
    this.voiceCheck();
  }

  getRandomInterval() {
    // In minutes
    const min = 30;
    const max = 180;

    const target = Math.round(Math.random() * (max - min)) + min;
    return 1000 * 60 * target;
  }

  voiceCheck() {
    Aquarius.Client.guilds.forEach(guild => {
      if (Aquarius.Permissions.isCommandEnabled(guild, this)) {
        const target = this.getSetting(guild.id, 'target');
        this.log(`Checking for user ${target}`);

        guild.channels.array().forEach(channel => {
          if (channel.type === 'voice') {
            if (channel.members.some(member => member.user.id === target)) {
              this.playClip(channel, target);
            }
          }
        });
      }
    });

    setTimeout(this.voiceCheck.bind(this), this.getRandomInterval());
  }

  playClip(channel, target) {
    let dispatcher = null;

    channel.join().then(connection => {
      this.log('Waiting for activity');

      // Disconnect after 10m of inactivity
      const inactivityCheck = setTimeout(connection.disconnect, 1000 * 60 * 10);

      connection.on('speaking', (user, speaking) => {
        if (user.id === target && speaking && dispatcher === null) {
          this.log('Playing Clip');
          dispatcher = connection.playFile(this.voiceClip);

          dispatcher.on('end', () => {
            this.log('Leaving channel');
            connection.disconnect();
            clearTimeout(inactivityCheck);
          });
        }
      });
    });
  }
}

module.exports = new Wilhelm();
