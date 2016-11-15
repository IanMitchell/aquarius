const Aquarius = require('../aquarius');

class Games extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Lists what games server members are playing and allows them to register games';
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += '```';
    msg += `@${nickname} games\n`;
    msg += `@${nickname} games list`;
    msg += `@${nickname} games [register|unregister] [game name] [#hexcolor]`;
    msg += `@${nickname} games [add|remove] [game name]`;
    msg += '```';

    return msg;
  }

  roleName(str) {
    return `${str}:AG`;
  }

  message(msg) {
    const registerRegex = /^games (register|unregister) (.+)(?: (#[A-Fa-f0-9]{6}))?$/i;
    const gameRegex = /^games (add|remove) (.+)$/i;

    const registerInput = Aquarius.Triggers.messageTriggered(msg, registerRegex);
    const gameInput = Aquarius.Triggers.messageTriggered(msg, gameRegex);

    if (registerInput && Aquarius.Permissions.isGuildModerator(msg.guild, msg.author)) {
      if (registerInput[1] === 'register') {
        if (msg.guild.roles.exists('name', this.roleName(registerInput[2]))) {
          msg.channel.sendMessage('Game already registered');
        } else {
          this.log(`Registering ${registerInput[2]}`);

          msg.guild.createRole({ name: this.roleName(registerInput[2]) })
            .then(role => role.setMentionable(true))
            .then(role => role.setColor(registerInput[3]))
            .then(role => role.setPermissions([]))
            .then(role => msg.channel.sendMessage(`Created ${role}`));
        }
      } else {
        this.log(`Removing ${registerInput[1]}`);
        msg.guild.roles.find('name', this.roleName(registerInput[1])).delete();
        msg.channel.sendMessage(`Removed ${registerInput[1]} from games list.`);
      }
    }

    if (gameInput) {
      const action = gameInput[1];
      const role = gameInput[2];
      const targetRole = msg.guild.roles.find('name', this.roleName(role));
      const targetUser = msg.guild.member(msg.author);

      if (targetRole) {
        if (action.toLowerCase() === 'add') {
          this.log(`Adding ${targetUser.user.username} to ${targetRole.name}`);
          targetUser.addRole(targetRole);
          msg.channel.sendMessage('Added to game list');
        } else {
          this.log(`Removing ${targetUser.user.username} from ${targetRole.name}`);
          targetUser.removeRole(targetRole);
          msg.channel.sendMessage('Removed from game list');
        }
      } else {
        msg.channel.sendMessage(`No associated role for ${role} found.`);
      }
    }

    if (Aquarius.Triggers.messageTriggered(msg, /^games$/i)) {
      this.log('Games request');

      const games = new Map();

      msg.guild.members.array().forEach(member => {
        const game = member.user.presence.game;

        if (game) {
          if (games.has(game.name)) {
            games.set(game.name, games.get(game.name) + 1);
          } else {
            games.set(game.name, 1);
          }
        }
      });

      let response = `**Games in ${msg.guild.name}**\n\n`;
      [...games].forEach((game, i) => {
        response += `${i + 1}. ${game[0]} _(${game[1]} playing)_\n`;
      });

      msg.channel.sendMessage(response);
    }
  }
}

module.exports = new Games();
