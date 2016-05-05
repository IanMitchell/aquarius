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

exports.messageTriggered = message => responses.has(message.toLowerCase());
exports.message = message => {
  log(`input: ${message}`);
  return responses.get(message.toLowerCase());
};

exports.helpTriggered = (message) => message.includes('reply');
exports.help = () => 'Reply automatically responds to certain phrases.';
