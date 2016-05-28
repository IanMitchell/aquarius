const debug = require('debug');
const aquarius = require('../client');
const permissions = require('../util/permissions');
const triggers = require('../util/triggers');

const log = debug('Nickname');

const message = msg => {
  const nicknameInput = triggers.messageTriggered(msg, /^nickname (.*)$/i);

  if (nicknameInput && permissions.isBotAdmin(msg.channel.server, msg.author)) {
    log(`Setting bot nickname to ${nicknameInput[1]} on ${msg.channel.server.id}`);
    aquarius.setNickname(msg.channel.server, nicknameInput[1], aquarius.user).then(data => {
      log(data);
      if (data.nick) {
        msg.client.sendMessage(msg.channel, `Nickname set to ${data.nick}`);
      } else {
        msg.client.sendMessage(msg.channel, 'Nickname removed');
      }
    }).catch(err => {
      log(err);
      msg.client.sendMessage(msg.channel, 'Error setting nickname. Please verify it is valid!');
    });
  }

  return false;
};

module.exports = {
  name: 'nickname',
  help: "`@bot nickname [name]`. Sets the bot's nickname for the server.",
  message,
};
