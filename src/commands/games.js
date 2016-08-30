const Aquarius = require('../aquarius');

class Games extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Lists what games server members are playing';
  }

  helpMessage(server) {
    let msg = super.helpMessage();
    const nickname = Aquarius.Users.getNickname(server, this.client.user);

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} games\`\`\``;
    return msg;
  }

  message(msg) {
    if (Aquarius.Triggers.messageTriggered(msg, /^games$/i)) {
      this.log('Games request');

      const games = new Map();

      msg.server.members.forEach(member => {
        if (member.game) {
          if (games.has(member.game.name)) {
            games.set(member.game.name, games.get(member.game.name) + 1);
          } else {
            games.set(member.game.name, 1);
          }
        }
      });

      let response = `**Games in ${msg.server.name}**\n\n`;
      [...games].forEach((game, i) => {
        response += `${i + 1}. ${game[0]} _(${game[1]} playing)_\n`;
      });

      return response;
    }

    return false;
  }
}

module.exports = new Games();
