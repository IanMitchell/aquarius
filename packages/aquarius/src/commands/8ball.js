import { Constants } from 'discord.js';
import { randomValue } from '../core/helpers/lists';
import getLogger, { getInteractionMeta } from '../core/logging/log';

const log = getLogger('8ball');

/** @type {import('discord.js').ApplicationCommandData} */
export const info = {
  name: '8ball',
  description: 'Outputs one of the classic 8ball responses.',
  options: [
    {
      type: Constants.ApplicationCommandOptionTypes.STRING,
      name: 'question',
      description: 'What do you wish to ask the 8ball?',
      required: true,
    },
  ],
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

/** @type {import('../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onSlash(info, (interaction) => {
    log.info('Generating response', getInteractionMeta(interaction));
    interaction.reply(`🎱 | ${randomValue(responses)}`);

    analytics.trackInteraction('8ball', interaction);
  });
};
