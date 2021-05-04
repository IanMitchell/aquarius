import Sentry from '@aquarius-bot/sentry';
import chronoNode from 'chrono-node';
import dateFns from 'date-fns';
import dedent from 'dedent-js';
import { Permissions } from 'discord.js';
import getLogger, { getMessageMeta } from '../../core/logging/log';

// CJS / ESM compatibility
const { subWeeks, startOfTomorrow } = dateFns;

const log = getLogger('Reminders');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'reminders',
  description: 'Ask the bot to remind you of something after a given time.',
  usage: dedent`
    **Add Reminder in Server**
    \`\`\`@Aquarius remindme <reminder>\`\`\`
    _Aquarius will do its best to determine when to send the reminder using NLP._

    **List Reminders in Server:**
    \`\`\`@Aquarius reminders list\`\`\`

    **Remove Reminder in Server**
    \`\`\`@Aquarius reminders remove <number>\`\`\`
    _You can get the number of your reminder by running the list command above. **The order changes! Be careful not to do this when a reminder is about to be sent!**_

    **Set a default timezone**
    You can set your default timezone by DMing the bot \`services add\`
  `,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  const formatDate = async (date, user) => {
    const service = await aquarius.services.getLink(user, 'Timezone');
    const tz = service?.values?.Timezone;

    try {
      return date.toLocaleString('en-US', {
        timeZone: tz ?? 'UTC',
        timeZoneName: 'short',
      });
    } catch (error) {
      return date.toLocaleString('en-US', {
        timeZone: 'UTC',
        timeZoneName: 'short',
      });
    }
  };

  let reminderTimeout = null;
  const refreshTimeout = async () => {
    log.info('Setting up Reminder timeout');
    clearTimeout(reminderTimeout);

    const reminder = await aquarius.database.reminder.findFirst({
      where: {
        time: {
          gte: subWeeks(new Date(), 1),
          lte: startOfTomorrow(),
        },
      },
      orderBy: {
        time: 'asc',
      },
    });

    if (!reminder) {
      reminderTimeout = setTimeout(
        () => refreshTimeout(),
        startOfTomorrow() - new Date()
      );
      return;
    }

    const timeout = reminder.time - new Date();
    reminderTimeout = setTimeout(
      async () => {
        const guild = await aquarius.guilds.fetch(reminder.guildId);

        if (!guild) {
          aquarius.database.reminder.deleteMany({
            where: {
              guildId: reminder.guildId,
            },
          });
          return;
        }

        const channel = guild.channels.resolve(reminder.channelId);
        const user = await guild.members.fetch(reminder.userId);

        if (!user) {
          aquarius.database.reminder.deleteMany({
            where: {
              guildId: reminder.guildId,
              userId: reminder.userId,
            },
          });
        }

        let text = reminder.message;
        if (
          !user.hasPermission(Permissions.FLAGS.MENTION_EVERYONE) &&
          (text.includes('@everyone') || text.includes('@here'))
        ) {
          text = text
            .replace('@everyone', '@-everyone')
            .replace('@here', '@-here');
        }

        if (channel.type === 'text') {
          channel.send(dedent`
            Hey ${user.toString()}! You asked me to remind you of this:
            > ${text}
          `);
        }

        await aquarius.database.reminder.delete({
          where: {
            id: reminder.id,
          },
        });

        refreshTimeout();
      },
      timeout > 0 ? timeout : 1
    );
  };

  aquarius.on('ready', async () => {
    refreshTimeout();
  });

  aquarius.onCommand(
    /^(remindme|reminders add) (?<input>.+)$/i,
    async (message, { groups }) => {
      try {
        log.info('Adding reminder', getMessageMeta(message));
        const date = chronoNode.parseDate(groups.input);

        if (date == null) {
          message.channel.send(
            "Sorry, but I wasn't able to figure out a date for your reminder."
          );
        } else if (date < new Date()) {
          message.channel.send('Sorry, but it looks like that is in the past.');
        } else {
          // Add to database
          await aquarius.database.reminder.create({
            data: {
              guildId: message.guild.id,
              channelId: message.channel.id,
              userId: message.author.id,
              message: groups.input,
              time: date,
            },
          });

          const time = await formatDate(date, message.author);
          message.channel.send(`Alright, I'll remind you on ${time}`);

          refreshTimeout();
        }

        analytics.trackUsage('remindme', message);
      } catch (error) {
        log.error(error.message);
        Sentry.captureException(error);

        message.channel.send(
          'Sorry, there was a problem adding your reminder.'
        );
      }
    }
  );

  aquarius.onCommand(/^reminders list$/i, async (message) => {
    try {
      log.info('Listing reminders', getMessageMeta(message));

      const reminders = await aquarius.database.reminder.findMany({
        where: {
          guildId: message.guild.id,
          userId: message.author.id,
        },
        orderBy: {
          time: 'asc',
        },
      });

      if (!reminders || reminders.length === 0) {
        message.channel.send(
          "It doesn't look like you have any reminders set right now!"
        );
      } else {
        const list = await Promise.all(
          reminders.map(async (reminder, index) => {
            const channel =
              message.guild.channels.resolve(reminder.channelId) ??
              '#deleted-channel';

            const time = await formatDate(reminder.time, message.author);
            return `${index + 1}. On ${time} in ${channel}, "${
              reminder.message
            }"`;
          })
        );

        message.channel.send(dedent`
          **__Your Active Reminders__**
          ${list.join('\n')}
        `);
      }

      analytics.trackUsage('list', message);
    } catch (error) {
      log.error(error.message);
      Sentry.captureException(error);

      message.channel.send(
        'Sorry, there was a problem listing your reminders.'
      );
    }
  });

  aquarius.onCommand(
    /^reminders remove (?<input>\d+)$/i,
    async (message, { groups }) => {
      try {
        log.info('Removing Reminder', getMessageMeta(message));
        let index = parseInt(groups.input, 10);

        if (Number.isNaN(index)) {
          message.channel.send("That doesn't look like a valid number, sorry!");
          return;
        }

        // Account for 0 indexing
        index -= 1;

        const reminders = await aquarius.database.reminder.findMany({
          where: {
            guildId: message.guild.id,
            userId: message.author.id,
          },
          orderBy: {
            time: 'asc',
          },
        });

        if (reminders[index]) {
          const reminder = await aquarius.database.reminder.delete({
            where: {
              id: reminders[index].id,
            },
          });

          refreshTimeout();

          const time = await formatDate(reminder.time, message.author);
          message.channel.send(
            `Alright, I will no longer remind you on ${time} to "${reminder.message}"`
          );
        } else {
          message.channel.send(
            "I wasn't able to find a reminder with that number, sorry!"
          );
        }

        analytics.trackUsage('remove', message);
      } catch (error) {
        log.error(error.message);
        Sentry.captureException(error);

        message.channel.send(
          'Sorry, there was a problem listing your reminders.'
        );
      }
    }
  );
};
