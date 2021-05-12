import chalk from 'chalk';
import dateFns from 'date-fns';
import dedent from 'dedent-js';
import { getInputAsNumber } from '../../core/helpers/input';
import getLogger, { getMessageMeta } from '../../core/logging/log';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

const log = getLogger('Quotes');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'quotes',
  description: 'Store memorable quotes.',
  usage: dedent`
    **Add a Quote**
    \`\`\`@Aquarius quotes add <quote>\`\`\`

    **Read a Quote**
    \`\`\`@Aquarius quotes read #5\`\`\`

    **Random Quote**
    \`\`\`@Aquarius quotes random\`\`\`
  `,
};

function getQuoteMessage(quote) {
  const time = formatDistance(quote.createdAt, new Date(), { addSuffix: true });

  return dedent`
    *Quote ${quote.quoteId} added by ${quote.addedBy} ${time}*
    ${quote.quote}
  `;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Add a `.quotes find phrase` command
  // TODO: Switch to slash command
  aquarius.onCommand(/^quotes random$/, async (message) => {
    log.info('Getting random quote', getMessageMeta(message));

    const quoteCount = await aquarius.database.quote.count({
      where: {
        guildId: message.guild.id,
      },
    });

    if (quoteCount === 0) {
      message.channel.send('There are no quotes in the server yet!');
      return;
    }

    const randomTarget = Math.floor(Math.random() * quoteCount);

    const quote = await aquarius.database.quote.findUnique({
      where: {
        guildId_quoteId: {
          quoteId: randomTarget,
          guildId: message.guild.id,
        },
      },
    });

    message.channel.send(getQuoteMessage(quote));
    analytics.trackUsage('random', message);
  });

  // TODO: Switch to slash command
  aquarius.onCommand(
    /^quotes read #?(?<id>[0-9]+)$/i,
    async (message, { groups }) => {
      log.info(
        `Reading quote ${chalk.blue(groups.id)}`,
        getMessageMeta(message)
      );

      const quoteId = getInputAsNumber(groups.id);

      if (quoteId) {
        const quote = await aquarius.database.quote.findUnique({
          where: {
            guildId_quoteId: {
              quoteId,
              guildId: message.guild.id,
            },
          },
        });

        if (!quote) {
          message.channel.send(`I couldn't find a quote with id #${groups.id}`);
          return;
        }

        message.channel.send(getQuoteMessage(quote));
      } else {
        message.channel.send("Sorry, it looks like that isn't a valid ID!");
      }

      analytics.trackUsage('read', message);
    }
  );

  // TODO: Switch to slash command
  aquarius.onCommand(
    /^quotes (?:new|add) (?<quote>[^]*)$/i,
    async (message, { groups }) => {
      log.info('Adding new quote', getMessageMeta(message));

      const quoteCount = await aquarius.database.quote.count({
        where: {
          guildId: message.guild.id,
        },
      });

      await aquarius.database.quote.create({
        data: {
          guildId: message.guild.id,
          channel: message.channel.name,
          addedBy: message.author.username,
          quoteId: quoteCount + 1,
          quote: groups.quote,
        },
      });

      message.channel.send(`Added quote #${quoteCount + 1}!`);
      analytics.trackUsage('add', message);
    }
  );
};
