const debug = require('debug');
const log = debug('Reply');

const responses = new Map();
responses.set('ping', 'pong');
responses.set('sing', 'song');
responses.set('bot respond', "I'm a pretty stupid bot.");
responses.set('bot be nice', 'sorry :(');
responses.set('gj bot', 'thx');
responses.set('thx bot', 'np');
responses.set('bot pls', '( ¬‿¬)');
responses.set('(╯°□°)╯︵ ┻━┻', '┬─┬﻿ ノ( ゜-゜ノ)');

const message = msg => {
  if (responses.has(msg.cleanContent.toLowerCase())) {
    log(`input: ${msg.cleanContent}`);
    return responses.get(msg.cleanContent.toLowerCase());
  }

  return false;
};

module.exports = {
  name: 'reply',
  help: 'Reply automatically responds to certain phrases.',
  message,
};
