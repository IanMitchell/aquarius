import dateFns from 'date-fns';
import debug from 'debug';
import dedent from 'dedent-js';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

const log = debug('Quotes');

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
  const time = formatDistance(quote.date, new Date(), { addSuffix: true });

  return dedent`
    *Quote ${quote.quoteId} added by ${quote.addedBy} ${time}*
    ${quote.quote}
  `;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Add a `.quotes find phrase` command

  aquarius.onCommand(/^quotes random$/, async (message) => {
    log('Getting random quote');

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

    const quote = await aquarius.database.quote.findOne({
      where: {
        quoteId: randomTarget,
        guildId: message.guild.id,
      },
    });

    message.channel.send(getQuoteMessage(quote));
    analytics.trackUsage('random', message);
  });

  aquarius.onCommand(
    /^quotes read #?(?<id>[0-9]+)$/i,
    async (message, { groups }) => {
      log(`Reading quote ${groups.id}`);

      const quote = await aquarius.database.quote.findOne({
        where: {
          quoteId: parseInt(groups.id, 10),
          guildId: message.guild.id,
        },
      });

      if (!quote) {
        message.channel.send(`I couldn't find a quote with id #${groups.id}`);
        return;
      }

      message.channel.send(getQuoteMessage(quote));
      analytics.trackUsage('read', message);
    }
  );

  aquarius.onCommand(
    /^quotes (?:new|add) (?<quote>[^]*)$/i,
    async (message, { groups }) => {
      log('Adding new quote');

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
