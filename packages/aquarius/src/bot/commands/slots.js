import debug from 'debug';
import dedent from 'dedent-js';
import { randomValue } from '../../core/helpers/lists';

const log = debug('Slots');

export const info = {
  name: 'slots',
  description: 'Simulates a slot roller.',
  usage: '```@Aquarius slots```',
};

const values = [
  '🍇',
  '🍊',
  '🍐',
  '🍒',
  '🍋',
  '🍎',
  '🍌',
  '🍉',
  '🍓',
  '🥝',
  '🍍',
  '🍑',
];

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^slots$/i, (message) => {
    log('Rolling');
    message.channel.send(dedent`
      ${randomValue(values)} | ${randomValue(values)} | ${randomValue(values)}
    `);

    analytics.trackUsage('slots', message);
  });
};
