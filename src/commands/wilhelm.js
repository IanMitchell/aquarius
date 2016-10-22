const Aquarius = require('../aquarius');

class Wilhelm extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'This one goes out to Shaun.';

    // Currently a bug in discord.js for <1s audio clips, so use irony for now
    this.voiceClip = `${__dirname}/../../data/wilhelm/irony.mp3`;
    this.target = '104067232371310592';

    setInterval(this.voiceCheck.bind(this), 1000 * 60 * 60 * 3);
    this.voiceCheck();
  }

  voiceCheck() {
    Aquarius.Client.guilds.forEach(guild => {
      if (Aquarius.Permissions.isCommandEnabled(guild, this)) {
        this.log('Checking for user');
        guild.channels.array().forEach(channel => {
          if (channel.type === 'voice') {
            if (channel.members.some(member => member.user.id === this.target)) {
              this.playClip(channel);
            }
          }
        });
      }
    });
  }

  playClip(channel) {
    let dispatcher = null;

    channel.join().then(connection => {
      this.log('Waiting for activity');

      // Disconnect after 10m of inactivity
      setTimeout(connection.disconnect, 1000 * 60 * 10);

      connection.on('speaking', (user, speaking) => {
        if (user.id === this.target && speaking && dispatcher === null) {
          this.log('Playing Clip');
          dispatcher = connection.playFile(this.voiceClip);

          dispatcher.on('end', () => {
            this.log(`Leaving channel`);
            connection.disconnect();
          });
        }
      });
    });
  }
}

module.exports = new Wilhelm();
