import { isGuildAdmin } from '@aquarius/permissions';
import debug from 'debug';
import dedent from 'dedent-js';

const log = debug('Reply');

export const info = {
  name: 'reply',
  description: 'Have the bot automatically respond to phrases.',
  usage: dedent`
    **List all Replies**
    \`\`\`@Aquarius reply list\`\`\`

    **Add Reply**
    \`\`\`@Aquarius reply add "<trigger>" "<response>"\`\`\`

    **Remove Reply**
    \`\`\`@Aquarius reply remove "<trigger>"\`\`\`
  `,
};

const RESPONSES = new Map();

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // Initialize Response Map
  aquarius.on('ready', () => {
    log('Loading Responses');

    aquarius.guilds.cache.map(async (guild) => {
      // This loop will be run twice - the first is the 'real' time, and the
      // second is the trigger map generation. We only want to have this run
      // on the real initialization.
      if (RESPONSES.has(guild.id)) {
        return;
      }

      RESPONSES.set(guild.id, new Map());

      const recordList = await aquarius.database.replies
        .where('guildId', '==', guild.id)
        .get();

      if (recordList.empty) {
        return;
      }

      recordList.docs.forEach((record) => {
        const reply = record.data();
        RESPONSES.get(reply.guildId).set(reply.trigger, reply.response);
      });
    });
  });

  aquarius.onMessage(info, async (message) => {
    const { id } = message.guild;
    const content = message.cleanContent.trim().toLowerCase();

    if (RESPONSES.has(id) && RESPONSES.get(id).has(content)) {
      log(`Input: ${message.cleanContent}`);
      const response = RESPONSES.get(id).get(content);
      message.channel.send(response);
      analytics.trackUsage('response', message, { response });
    }
  });

  aquarius.onCommand(/^reply list$/i, async (message) => {
    log('Listing replies');

    if (
      RESPONSES.has(message.guild.id) &&
      RESPONSES.get(message.guild.id).size > 0
    ) {
      const entries = Array.from(RESPONSES.get(message.guild.id)).reduce(
        (str, [key]) => `${str} * '${key}'\n`,
        ''
      );

      message.channel.send(dedent`
        **Replies:**

        ${entries}
      `);
    } else {
      message.channel.send('No replies have been set yet!');
    }

    analytics.trackUsage('list', message);
  });

  aquarius.onCommand(
    /^reply remove "(?<trigger>[\s\S]+)"$/i,
    async (message, { groups }) => {
      if (isGuildAdmin(message.guild, message.author)) {
        log(`Removing ${groups.trigger}`);

        const responses = await aquarius.database.replies
          .where('guildId', '==', message.guild.id)
          .where('trigger', '==', groups.trigger.toLowerCase())
          .get();

        if (!responses.empty) {
          responses.docs[0].ref.delete();
          RESPONSES.get(message.guild.id).delete(groups.trigger.toLowerCase());

          message.channel.send(`Removed '${groups.trigger}'`);
          analytics.trackUsage('remove', message);
        } else {
          message.channel.send(
            `I couldn't find a reply for '${groups.trigger}', sorry!`
          );
        }
      }
    }
  );

  aquarius.onCommand(
    // Lol :'(
    new RegExp(
      [
        '^reply add ', // Cmd Trigger
        '(["\'])(?<trigger>(?:(?=(\\\\?))\\3[\\s\\S])*?)\\1 ', // Reply trigger (Quoted text block 1)
        '(["\'])(?<response>(?:(?=(\\\\?))\\3[\\s\\S])*?)\\1$', // Response (Quoted text block 2)
      ].join(''),
      'i'
    ),
    async (message, { groups }) => {
      if (isGuildAdmin(message.guild, message.author)) {
        log(`Adding reply: "${groups.trigger}" -> "${groups.response}"`);

        if (RESPONSES.get(message.guild.id).has(groups.trigger.toLowerCase())) {
          message.channel.send('A reply with that trigger already exists!');
          return;
        }

        const response = await aquarius.database.replies.add({
          guildId: message.guild.id,
          trigger: groups.trigger.toLowerCase(),
          response: groups.response,
        });

        if (response) {
          RESPONSES.get(message.guild.id).set(
            groups.trigger.toLowerCase(),
            groups.response
          );
          message.channel.send('Reply added!');
          analytics.trackUsage('add', message);
        } else {
          message.channel.send('Sorry, something went wrong!');
        }
      }
    }
  );
};
