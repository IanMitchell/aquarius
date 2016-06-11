const debug = require('debug');
const log = debug('Same');

const MESSAGE_STACK_SIZE = 4;
const messageStack = new Map();

const pushMessage = msg => {
  const server = msg.channel.server.id;
  const channel = msg.channel.name;

  if (!messageStack.get(server)) {
    log(`Creating entry for ${server}`);
    messageStack.set(server, new Map());

    msg.channel.server.channels.forEach(chan => {
      messageStack.get(server).set(chan.name, []);
    });
  }

  messageStack.get(server).get(channel).push(msg.cleanContent);

  // Only track last couple messages
  if (messageStack.get(server).get(channel).length > MESSAGE_STACK_SIZE) {
    messageStack.get(server).get(channel).shift();
  }
};

const onlyUnique = (value, index, self) => self.indexOf(value) === index;

const isSame = msg => {
  const server = msg.channel.server.id;
  const channel = msg.channel.name;

  if (!messageStack.get(server).get(channel)) {
    return false;
  }

  if (messageStack.get(server).get(channel).length !== MESSAGE_STACK_SIZE) {
    return false;
  }

  const unique = messageStack.get(server).get(channel).filter(onlyUnique);

  if (unique.length === 1 && unique[0] === msg.cleanContent) {
    return true;
  }

  return false;
};

const message = msg => {
  // TODO: Crashes on new server addition

  if (msg.cleanContent === '') {
    return false;
  }

  pushMessage(msg);

  if (isSame(msg)) {
    log(`Sending '${msg.cleanContent}' to ${msg.channel.server.id}`);
    messageStack.get(msg.channel.server.id).set(msg.channel.name, []);
    return msg.cleanContent;
  }

  return false;
};

module.exports = {
  name: 'same',
  help: 'Same automatically responds to certain phrases.',
  message,
};
