const Aquarius = require('../aquarius');

class Nickname extends Aquarius.Command {
  message(msg) {
    const nicknameInput = Aquarius.Triggers.messageTriggered(msg, /^nick(?:name)? (.*)$/i);

    if (nicknameInput && Aquarius.Permissions.isServerAdmin(msg.server, msg.author)) {
      this.log(`Setting bot nickname to ${nicknameInput[1]} on ${msg.server.id}`);
      this.client.setNickname(msg.server, nicknameInput[1], this.client.user).then(data => {
        if (data.nick) {
          this.client.sendMessage(msg.channel, `Nickname set to ${data.nick}`);
        } else {
          this.client.sendMessage(msg.channel, 'Nickname removed');
        }
      }).catch(err => {
        this.log(err);
        msg.client.sendMessage(msg.channel, 'Error setting nickname. Please verify it is valid!');
      });
    }

    return false;
  }
}

module.exports = new Nickname();
