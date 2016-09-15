const Aquarius = require('../aquarius');

class Nickname extends Aquarius.Command {
  message(msg) {
    const nicknameInput = Aquarius.Triggers.messageTriggered(msg, /^nick(?:name)? (.*)$/i);

    if (nicknameInput && Aquarius.Permissions.isGuildAdmin(msg.guild, msg.author)) {
      this.log(`Setting bot nickname to ${nicknameInput[1]} on ${msg.guild.id}`);

      msg.guild.fetchMember(Aquarius.Client.user)
        .then(user => user.setNickname(nicknameInput[1]))
        .then(user => {
          if (user.nickname === nicknameInput[1]) {
            msg.channel.sendMessage(`Nickname set to ${user.nickname}`);
          } else {
            msg.channel.sendMessage('Nickname removed');
          }
        })
        .catch(err => {
          this.log(err);
          msg.channel.sendMessage('Error setting nickname. Please verify it is valid!');
        });
    }

    return false;
  }
}

module.exports = new Nickname();
