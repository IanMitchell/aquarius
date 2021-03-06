import chalk from 'chalk';
import dedent from 'dedent-js';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Reply');

/** @type {import('../../typedefs').CommandInfo} */
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
    log.info('Loading Responses');

    aquarius.guilds.cache.map(async (guild) => {
      // This loop will be run twice - the first is the 'real' time, and the
      // second is the trigger map generation. We only want to have this run
      // on the real initialization.
      if (RESPONSES.has(guild.id)) {
        return;
      }

      RESPONSES.set(guild.id, new Map());

      const responses = await aquarius.database.reply.findMany({
        where: { guildId: guild.id },
      });

      if (!responses.length) {
        return;
      }

      responses.forEach((reply) => {
        RESPONSES.get(reply.guildId).set(reply.trigger, reply.response);
      });
    });
  });

  aquarius.onMessage(info, (message) => {
    const { id } = message.guild;
    const content = message.cleanContent.trim().toLowerCase();

    if (RESPONSES.has(id) && RESPONSES.get(id).has(content)) {
      log.info(
        `Input: ${chalk.blue(message.cleanContent)}`,
        getMessageMeta(message)
      );
      const response = RESPONSES.get(id).get(content);
      message.channel.send(response);
      analytics.trackUsage('response', message, { response });
    }
  });

  aquarius.onCommand(/^reply list$/i, (message) => {
    log.info('Listing replies', getMessageMeta(message));

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
      if (aquarius.permissions.isAdmin(message.guild, message.author)) {
        log.info(
          `Removing ${chalk.blue(groups.trigger)}`,
          getMessageMeta(message)
        );

        const response = await aquarius.database.reply.delete({
          where: {
            guildId_trigger: {
              guildId: message.guild.id,
              trigger: groups.trigger.toLowerCase(),
            },
          },
        });

        if (response) {
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
      if (aquarius.permissions.isAdmin(message.guild, message.author)) {
        log.info(
          `Adding reply: "${chalk.blue(groups.trigger)}" -> "${chalk.blue(
            groups.response
          )}"`,
          getMessageMeta(message)
        );

        if (RESPONSES.get(message.guild.id).has(groups.trigger.toLowerCase())) {
          message.channel.send('A reply with that trigger already exists!');
          return;
        }

        const response = await aquarius.database.reply.create({
          data: {
            guildId: message.guild.id,
            trigger: groups.trigger.toLowerCase(),
            response: groups.response,
          },
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
