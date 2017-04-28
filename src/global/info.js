const Discord = require('discord.js');
const Aquarius = require('../aquarius');
const pkg = require('../../package');

class Info extends Aquarius.Command {
  message(msg) {
    if (Aquarius.Triggers.messageTriggered(msg, /^info$/)) {
      this.log('Info Request');

      Aquarius.Users.getNickname(msg.guild, Aquarius.Client.user).then(nickname => {
        const message = new Discord.RichEmbed({
          title: 'Aquarius',
          color: 0x008000,
          description: "I'm a bot!",
          url: Aquarius.Links.botLink(),
          footer: {
            text: `Version: ${pkg.version}`,
          },
          thumbnail: {
            url: Aquarius.Client.user.displayAvatarURL,
          },
          fields: [
            {
              name: 'Developer',
              value: 'Desch#3091',
            },
            {
              name: 'Repository',
              value: Aquarius.Links.repoLink(),
            },
            {
              name: 'Need Help?',
              value: `Type \`@${nickname} help\``,
            },
          ],
        });

        msg.channel.sendEmbed(message);
      });
    }

    if (Aquarius.Triggers.messageTriggered(msg, /^issue$/)) {
      this.log('Issue Request');

      let str = '🎉 OPEN 🎉 A 🎉 GITHUB 🎉 ISSUE 🎉\n';
      str += `${Aquarius.Links.repoLink()}/issues`;

      msg.channel.sendMessage(str);
    }
  }
}

module.exports = new Info();
