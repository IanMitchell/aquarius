const debug = require('debug');
const log = debug('Same');

const MESSAGE_STACK_SIZE = 4;
const messageStack = new Map();

const pushMessage = (channel, text) => {
  if (!messageStack.get(channel)) {
    log(`Creating entry for ${channel}`);
    messageStack.set(channel, []);
  }

  messageStack.get(channel).push(text);

  // Only track last couple messages
  if (messageStack.get(channel).length > MESSAGE_STACK_SIZE) {
    messageStack.get(channel).shift();
  }
};

const onlyUnique = (value, index, self) => self.indexOf(value) === index;

const isSame = (channel, message) => {
  if (!messageStack.get(channel)) {
    return false;
  }

  if (messageStack.get(channel).length !== MESSAGE_STACK_SIZE) {
    return false;
  }

  const unique = messageStack.get(channel).filter(onlyUnique);

  if (unique.length === 1 && unique[0] === message) {
    return true;
  }

  return false;
};


exports.messageTriggered = message => {
  // TODO: Set per-channel
  pushMessage('discord', message);
  return isSame('discord', message);
};
exports.message = message => {
  log(`Sending ${message}`);
  messageStack.set('discord', []);
  return message;
};

exports.helpTriggered = message => message.includes('same');
exports.help = () => 'Same automatically responds to certain phrases.';
