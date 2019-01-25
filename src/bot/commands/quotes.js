import debug from 'debug';
import dedent from 'dedent-js';
import { formatDistance } from 'date-fns';

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
  disabled: true,
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

    // FIXME: Cosmos
    const [quote] = await aquarius.database.quotes.aggregate([
      {
        $match: { guildId: message.guild.id },
      },
      {
        $sample: { size: 1 },
      },
    ]);

    if (!quote) {
      message.channel.send('There are no quotes in the server yet!');
      return;
    }

    message.channel.send(getQuoteMessage(quote));
    analytics.trackUsage('random', message);
  });

  aquarius.onCommand(/^quotes read #?(?<id>[0-9]+)$/i, async (message, { groups }) => {
    log(`Reading quote ${groups.id}`);

    // FIXME: Cosmos
    const quote = await aquarius.database.quotes.findOne({
      guildId: message.guild.id,
      quoteId: parseInt(groups.id, 10),
    });

    if (!quote) {
      message.channel.send(`I couldn't find a quote with id #${groups.id}`);
      return;
    }

    message.channel.send(getQuoteMessage(quote));
    analytics.trackUsage('read', message);
  });

  aquarius.onCommand(/^quotes (?:new|add) (?<quote>[^]*)$/i, async (message, { groups }) => {
    log('Adding new quote');

    // FIXME: Cosmos
    const [latestQuote] = await aquarius.database.quotes
      .findAsCursor({ guildId: message.guild.id })
      .sort({ quoteId: -1 })
      .limit(1)
      .toArray();

    const id = 1 + (latestQuote ? latestQuote.quoteId : 0);

    // FIXME: Cosmos
    await aquarius.database.quotes.insert({
      guildId: message.guild.id,
      channelName: message.channel.name,
      addedBy: message.author.username,
      quoteId: id,
      quote: groups.quote,
      date: Date.now(),
    });

    message.channel.send(`Added quote #${id}!`);
    analytics.trackUsage('add', message);
  });
};
