const client = require('../client.js');

const mentionRegex = '(?:(?:@[#\\w]+)|(?:<@!?\\d+>))';
const botMention = () => client.user.mention();

const mentionTrigger = (msg) => msg.content.startsWith(botMention());
const dotTrigger = (msg) => msg.content.startsWith('.');
const exclamationTrigger = (msg) => msg.content.startsWith('!');

const messageTriggered = (msg, trigger) => {
  if (msg.author.bot) {
    return false;
  }

  if (mentionTrigger(msg)) {
    return msg.content.split(`${botMention()} `)[1].match(trigger);
  }

  if (dotTrigger(msg, trigger) || exclamationTrigger(msg, trigger)) {
    return msg.content.substr(1).match(trigger);
  }

  return false;
};

const customTrigger = (msg, trigger) => {
  if (msg.author.bot) {
    return false;
  }

  return msg.content.match(trigger);
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
