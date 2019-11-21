import debug from 'debug';
import { randomValue } from '../../lib/helpers/lists.js';

const log = debug('8ball');

export const info = {
  name: '8ball',
  description: 'Outputs one of the classic 8ball responses.',
  usage: '```@Aquarius 8ball <message>```',
};

const responses = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes, definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  "Don't count on it",
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful',
];

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^8ball .+$/i, async message => {
    log('Generating response');
    message.channel.send(randomValue(responses));

    analytics.trackUsage('8ball', message);
  });
};
