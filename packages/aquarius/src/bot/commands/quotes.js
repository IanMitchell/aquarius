import dateFns from 'date-fns';
import debug from 'debug';
import dedent from 'dedent-js';
import { randomValue } from '../../core/helpers/lists';

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

  aquarius.onCommand(/^quotes random$/, async message => {
    log('Getting random quote');

    const quoteList = await aquarius.database.quotes
      .where('guildId', '==', message.guild.id)
      .get();

    if (quoteList.empty) {
      message.channel.send('There are no quotes in the server yet!');
      return;
    }

    const quote = randomValue(quoteList.docs);
    message.channel.send(getQuoteMessage(quote.data()));
    analytics.trackUsage('random', message);
  });

  aquarius.onCommand(
    /^quotes read #?(?<id>[0-9]+)$/i,
    async (message, { groups }) => {
      log(`Reading quote ${groups.id}`);

      const list = await aquarius.database.quotes
        .where('quoteId', '==', parseInt(groups.id, 10))
        .where('guildId', '==', message.guild.id)
        .get();

      if (list.empty) {
        message.channel.send(`I couldn't find a quote with id #${groups.id}`);
        return;
      }

      message.channel.send(getQuoteMessage(list.docs[0].data()));
      analytics.trackUsage('read', message);
    }
  );

  aquarius.onCommand(
    /^quotes (?:new|add) (?<quote>[^]*)$/i,
    async (message, { groups }) => {
      log('Adding new quote');

      let id = 1;
      const quoteRef = await aquarius.database.quotes
        .where('guildId', '==', message.guild.id)
        .orderBy('quoteId', 'desc')
        .limit(1)
        .get();

      if (!quoteRef.empty) {
        id = quoteRef.docs[0].data().quoteId + 1;
      }

      await aquarius.database.quotes.add({
        guildId: message.guild.id,
        channelName: message.channel.name,
        addedBy: message.author.username,
        quoteId: id,
        quote: groups.quote,
        date: Date.now(),
      });

      message.channel.send(`Added quote #${id}!`);
      analytics.trackUsage('add', message);
    }
  );
};
