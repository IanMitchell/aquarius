import dedent from 'dedent-js';
import { randomValue } from '../../core/helpers/lists';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Slots');

/** @type {import('../../typedefs').CommandInfo} */
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
    log.info('Rolling', getMessageMeta(message));
    message.channel.send(dedent`
      ${randomValue(values)} | ${randomValue(values)} | ${randomValue(values)}
    `);

    analytics.trackUsage('slots', message);
  });
};
