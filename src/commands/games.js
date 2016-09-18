const Aquarius = require('../aquarius');

class Games extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Lists what games server members are playing';
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} games\`\`\``;
    return msg;
  }

  message(msg) {
    if (Aquarius.Triggers.messageTriggered(msg, /^games$/i)) {
      this.log('Games request');

      const games = new Map();

      msg.guild.members.forEach(member => {
        if (member.user.game) {
          if (games.has(member.user.game.name)) {
            games.set(member.user.game.name, games.get(member.user.game.name) + 1);
          } else {
            games.set(member.user.game.name, 1);
          }
        }
      });

      let response = `**Games in ${msg.guild.name}**\n\n`;
      [...games].forEach((game, i) => {
        response += `${i + 1}. ${game[0]} _(${game[1]} playing)_\n`;
      });

      return response;
    }

    return false;
  }
}

module.exports = new Games();
