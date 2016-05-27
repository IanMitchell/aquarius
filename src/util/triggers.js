const client = require('../client');

const mentionRegex = '(?:(?:@[#\\w]+)|(?:<@!?\\d+>))';
const botMention = () => client.user.mention();

const mentionTrigger = (msg) => msg.content.trim().startsWith(botMention());
const dotTrigger = (msg) => msg.content.trim().startsWith('.');
const exclamationTrigger = (msg) => msg.content.trim().startsWith('!');

const messageTriggered = (msg, trigger) => {
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
};

const customTrigger = (msg, trigger) => {
  if (msg.author.bot) {
    return false;
  }

  return msg.content.trim().match(trigger);
};


module.exports = {
  mentionRegex,
  botMention,
  mentionTrigger,
  dotTrigger,
  exclamationTrigger,
  messageTriggered,
  customTrigger,
};
