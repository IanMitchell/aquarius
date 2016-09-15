const Aquarius = require('../aquarius');

class Nickname extends Aquarius.Command {
  message(msg) {
    const nicknameInput = Aquarius.Triggers.messageTriggered(msg, /^nick(?:name)? (.*)$/i);

    if (nicknameInput && Aquarius.Permissions.isGuildAdmin(msg.guild, msg.author)) {
      this.log(`Setting bot nickname to ${nicknameInput[1]} on ${msg.guild.id}`);
      Aquarius.Client.setNickname(msg.guild, nicknameInput[1], Aquarius.Client.user).then(data => {
        if (data.nick) {
          msg.channel.sendMessage(`Nickname set to ${data.nick}`);
        } else {
          msg.channel.sendMessage('Nickname removed');
        }
      }).catch(err => {
        this.log(err);
        msg.channel.sendMessage('Error setting nickname. Please verify it is valid!');
      });
    }

    return false;
  }
}

module.exports = new Nickname();
