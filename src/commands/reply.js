const debug = require('debug');
const log = debug('Reply');

const responses = new Map();
responses.set('ping', 'pong');
responses.set('sing', 'song');
responses.set('hi bot', 'hey beautiful c;');
responses.set('bot respond', "I'm a pretty stupid bot.");
responses.set('bot be nice', 'sorry :c');
responses.set('gj bot', 'thx');
responses.set('thx bot', 'np');
responses.set('bot pls', '( ¬‿¬)');
responses.set('not now bot', 'aww ok :c');
responses.set('go away bot', 'I just wanted to be friends');
responses.set('(╯°□°)╯︵ ┻━┻', '┬─┬﻿ ノ( ゜-゜ノ)');
responses.set( '┬─┬﻿ ノ( ゜-゜ノ)', 'THAT\'S MY JOB');

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
