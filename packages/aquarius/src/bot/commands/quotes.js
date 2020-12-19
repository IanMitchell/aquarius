import dateFns from 'date-fns';
import debug from 'debug';
import dedent from 'dedent-js';
import * as regex from '@aquarius-bot/regex';
import { getInputAsNumber } from '../../core/helpers/input';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

const log = debug('Quotes');

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

  if (!quote.saidBy)
    return dedent`
      *Quote ${quote.quoteId} added by ${quote.addedBy} ${time}*
      ${quote.quote}
    `;

  return dedent`
    *Quote ${quote.quoteId} from <@${quote.saidBy}> added by ${quote.addedBy} ${time}*
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
        guildId_quoteId: {
          quoteId: randomTarget,
          guildId: message.guild.id,
        },
      },
    });

    message.channel.send(getQuoteMessage(quote));
    analytics.trackUsage('random', message);
  });

  aquarius.onCommand(
    /^quotes read #?(?<id>[0-9]+)$/i,
    async (message, { groups }) => {
      log(`Reading quote ${groups.id}`);

      const quoteId = getInputAsNumber(groups.id);

      if (quoteId) {
        const quote = await aquarius.database.quote.findOne({
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

  async function addQuote(message, text, saidBy) {
    const quoteCount = await aquarius.database.quote.count({
      where: {
        guildId: message.guild.id,
      },
    });

    await aquarius.database.quote.create({
      data: {
        guildId: message.guild.id,
        channel: message.channel.id,
        addedBy: message.author.username,
        saidBy,
        quoteId: quoteCount + 1,
        quote: text,
      },
    });

    message.channel.send(`Added quote #${quoteCount + 1}!`);
    analytics.trackUsage('add', message);
  }

  aquarius.onCommand(
    RegExp(`^quote ${regex.MENTION_USER.source} (?<search>[^]*)$`, 'i'),
    async (message, { groups }) => {
      log('Adding new quote by search');

      const search = groups.search.toLowerCase();

      const history = await message.channel.fetch({ before: message.id });
      const result = history.reduce((best, cur) => {
        if (
          cur.author.id === groups.id &&
          (!best || cur.createdAt > best.createdAt) &&
          cur.cleanContent.toLowerCase().contains(search)
        )
          return cur;
        return best;
      });

      if (!result) {
        message.channel.send(
          `Sorry, I don't remember what <@${groups.id}> said about ${groups.search}.`
        );
        return;
      }

      addQuote(message, groups.id, result.cleanContent);
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
