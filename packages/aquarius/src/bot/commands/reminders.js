import Sentry from '@aquarius-bot/sentry';
import chronoNode from 'chrono-node';
import dateFns from 'date-fns';
import dedent from 'dedent-js';
import getLogger, { getMessageMeta } from '../../core/logging/log';

// CJS / ESM compatibility
const { subWeeks, addDays, startOfTomorrow } = dateFns;

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
  `,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  let reminderTimeout = null;
  const refreshTimeout = async () => {
    log.info('Setting up Reminder timeout');
    clearTimeout(reminderTimeout);

    const reminder = await aquarius.database.reminder.findFirst({
      where: {
        time: {
          gte: subWeeks(new Date(), 1),
          lte: addDays(new Date(), 2),
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

        if (channel.type === 'text') {
          channel.send(dedent`
            Hey ${user.toString()}! You asked me to remind you of this:
            > ${reminder.message}
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

        if (date < new Date()) {
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

          message.channel.send(
            `Alright, I'll remind you on ${date.toLocaleString()}`
          );

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

      if (!reminders) {
        message.channel.send(
          "It doesn't look like you have any reminders set right now!"
        );
      } else {
        const list = reminders.map((reminder, index) => {
          const channel =
            message.guild.channels.resolve(reminder.channelId) ??
            '#deleted-channel';

          return `${
            index + 1
          }. On ${reminder.time.toLocaleString()} in ${channel}, "${
            reminder.message
          }"`;
        });

        message.channel.send(dedent`
          **__Active Reminders__**
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

          message.channel.send(
            `Alright, I will no longer remind you on ${reminder.time.toLocaleString()} to "${
              reminder.message
            }"`
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
