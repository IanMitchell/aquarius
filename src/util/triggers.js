const client = require('../core/client');

const mentionRegex = '(?:(?:@[#\\w]+)|(?:<@!?\\d+>))';

function botMention() {
  return client.user.mention();
}

function mentionTrigger(msg) {
  return msg.content.trim().startsWith(botMention());
}

function nicknameMentionTrigger(msg) {
  if (msg.mentions.length > 0 && msg.mentions[0].equals(client.user)) {
    return msg.content.trim().match(new RegExp(`^${mentionRegex}`));
  }

  return false;
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

  // Drop triggers for PMs
  if (msg.server === undefined) {
    return msg.content.trim().match(trigger);
  }

  // @aquarius trigger [msg]
  if (mentionTrigger(msg)) {
    return msg.content.trim().split(`${botMention()} `)[1].match(trigger);
  }

  // NOTE: Different because of how the message is broadcasted from Discord.
  // Uses <@![0-9]> instead of <@[0-9]>
  // @aquarius trigger [msg]
  if (nicknameMentionTrigger(msg)) {
    return msg.content.trim().replace(new RegExp(`^${mentionRegex} `), '').match(trigger);
  }

  // .trigger [msg] OR !trigger [msg]
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
  nicknameMentionTrigger,
  dotTrigger,
  exclamationTrigger,
  messageTriggered,
  customTrigger,
};
