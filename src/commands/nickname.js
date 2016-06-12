const client = require('../core/client');
const permissions = require('../util/permissions');
const triggers = require('../util/triggers');
const Command = require('../core/command');

class Nickname extends Command {
  message(msg) {
    const nicknameInput = triggers.messageTriggered(msg, /^nickname (.*)$/i);

    if (nicknameInput && permissions.isServerAdmin(msg.channel.server, msg.author)) {
      this.log(`Setting bot nickname to ${nicknameInput[1]} on ${msg.channel.server.id}`);
      client.setNickname(msg.channel.server, nicknameInput[1], client.user).then(data => {
        if (data.nick) {
          msg.client.sendMessage(msg.channel, `Nickname set to ${data.nick}`);
        } else {
          msg.client.sendMessage(msg.channel, 'Nickname removed');
        }
      }).catch(err => {
        this.log(err);
        msg.client.sendMessage(msg.channel, 'Error setting nickname. Please verify it is valid!');
      });
    }

    return false;
  }

  helpMessage() {
    return "`@bot nickname [name]`. Sets the bot's nickname for the server.";
  }
}

module.exports = new Nickname();
