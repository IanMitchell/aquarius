const debug = require('debug');
const log = debug('Reply');

const dickbutt_img = 'https://i.imgur.com/etjgJ2D.jpg';

const greetings = [
  'hi',
  'sup',
  '~ohayo'
];

function randomGreeting() {
  greeting = greetings[Math.floor(Math.random() * greetings.length)];
  log(greeting);
  return greeting;	
}

const responses = new Map();
responses.set('ping', 'pong');
responses.set('sing', 'song');
//this creates the response at startup time
//want to dynamically create response
responses.set('hi bot', randomGreeting());
responses.set('bot respond', "I'm a pretty stupid bot.");
responses.set('bot be nice', 'sorry :c');
responses.set('gj bot', 'thx');
responses.set('thx bot', 'np');
responses.set('bot pls', '( ¬‿¬)');
responses.set('not now bot', 'aww ok :c');
responses.set('go away bot', 'I have nowhere else to go');
responses.set('not cool bot', 'I just wanted to be friends');
responses.set('(╯°□°）╯︵ ┻━┻', '┬─┬﻿ ノ( ゜-゜ノ)');
responses.set( '┬─┬﻿ ノ( ゜-゜ノ)', "THAT'S MY JOB");
responses.set('dickbutt', dickbutt_img);

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
