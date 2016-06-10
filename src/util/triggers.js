const client = require('../core/client');

const mentionRegex = '(?:(?:@[#\\w]+)|(?:<@!?\\d+>))';

function botMention() {
  return client.user.mention();
}

function mentionTrigger(msg) {
  return msg.content.trim().startsWith(botMention());
}

function dotTrigger(msg) {
  return msg.content.trim().startsWith('.');
}

function exclamationTrigger(msg) {
  return msg.content.trim().startsWith('!');
}

function messageTriggered(msg, trigger) {
  if (msg.author.bot) {
    return false;
  }

  if (mentionTrigger(msg)) {
    return msg.content.trim().split(`${botMention()} `)[1].match(trigger);
  }

  if (dotTrigger(msg, trigger) || exclamationTrigger(msg, trigger)) {
    return msg.content.trim().substr(1).match(trigger);
  }

  return false;
}

function customTrigger(msg, trigger) {
  if (msg.author.bot) {
    return false;
  }

  return msg.content.trim().match(trigger);
}

module.exports = {
  mentionRegex,
  botMention,
  mentionTrigger,
  dotTrigger,
  exclamationTrigger,
  messageTriggered,
  customTrigger,
};
