const debug = require('debug');
const log = debug('Dickbutt');


const dickbutt_img = 'https://i.imgur.com/etjgJ2D.jpg';

const message = msg => {
  const botMention = msg.client.user.mention().toLowerCase();
  if (msg.content.toLowerCase().startsWith(`${botMention} dickbutt`)) {
    log('dickbutt request');
    return dickbutt_img;
  }

  return false;
};

module.exports = {
  name: 'dickbutt',
  help: 'Nothing to explain. Just enjoy.',
  message,
};