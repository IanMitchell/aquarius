const client = require('./client');

const mentionRegex = '(?:(?:@[#\\w]+)|(?:<@!?\\d+>))';
const channelRegex = '<#\\d+>';

function botMention() {
  return client.user.toString();
}

function botNicknameMention() {
  return new RegExp(`(?:(?:<@!?${client.user.id}+>))`);
}

function mentionTrigger(msg) {
  return msg.content.trim().startsWith(botMention());
}

function nicknameMentionTrigger(msg) {
  return msg.content.trim().match(new RegExp(`^${botNicknameMention().source}`));
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
  if (msg.guild === undefined || msg.guild === null) {
    return msg.content.trim().match(trigger);
  }

  // @aquarius trigger [msg]
  if (mentionTrigger(msg)) {
    return msg.content.trim().split(`${botMention()} `)[1].match(trigger);
  }

  // NOTE: Different because of how the message is broadcasted from Discord.
  // Uses <@![0-9]> instead of <@[0-9]>
  // @aquariusnick trigger [msg]
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

function cardTrigger(msg) {
  if (msg.author.bot) {
    return false;
  }

  const cardRegex = /\[\[(.+?)\]\]/ig;
  const matches = [];
  let match = null;

  do {
    match = cardRegex.exec(msg.content.trim());

    if (match) {
      matches.push(match);
    }
  } while (match !== null);

  return matches;
}

module.exports = {
  mentionRegex,
  channelRegex,
  botMention,
  mentionTrigger,
  nicknameMentionTrigger,
  dotTrigger,
  exclamationTrigger,
  messageTriggered,
  customTrigger,
  cardTrigger,
};
