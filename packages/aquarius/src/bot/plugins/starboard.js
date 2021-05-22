import { getLink } from '@aquarius-bot/messages';
import { getNickname } from '@aquarius-bot/users';
import chalk from 'chalk';
import { MessageEmbed, Permissions } from 'discord.js';
import { getInputAsNumber } from '../../core/helpers/input';
import getLogger from '../../core/logging/log';

const log = getLogger('Starboard');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'starboard',
  description:
    'Messages with enough star reactions will be posted to a channel',
};

const DEFAULT_AMOUNT = 5;

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, settings, analytics }) => {
  settings.register(
    'amount',
    'Number of :star: reactions to trigger on',
    DEFAULT_AMOUNT
  );
  settings.register('channel', 'Channel name to post in', null);
  settings.register(
    'public',
    'Only track messages in channels that @everyone can access (true/false)',
    'true'
  );

  const getAmount = (guild) => {
    const value =
      getInputAsNumber(settings.get(guild.id, 'amount')) ?? DEFAULT_AMOUNT;
    return Math.max(1, value);
  };

  aquarius.on('messageReactionAdd', async (messageReaction) => {
    const { message } = messageReaction;
    const { guild } = message;
    
    if (message.author.id === aquarius.user?.id || messageReaction.emoji.name !== '⭐') {
      return;
    }

    if (aquarius.guildManager.get(guild.id).isCommandEnabled(info.name)) {
      const onlyPublic = settings.get(guild.id, 'public') !== 'false';

      if (
        onlyPublic &&
        !message.channel
          .permissionsFor(guild.roles.everyone)
          .has(Permissions.FLAGS.VIEW_CHANNEL)
      ) {
        log.info('Ignoring Starred message');
        return;
      }

      if (messageReaction.count < getAmount(guild)) {
        return;
      }

      const target = settings.get(guild.id, 'channel');
      const channel = guild.channels.cache.find((chan) => chan.name === target);

      if (!channel) {
        const errorMsg =
          "Hey! Unfortunately I can't find a channel to post starred messages to. Please have an admin DM me with `set starboard channel <name>` to fix this!";

        const previousMessages = await message.channel.messages.fetch({
          limit: 100,
        });

        if (!previousMessages.some((msg) => msg.content === errorMsg)) {
          message.channel.send(errorMsg);
        }

        log.info(`Could not find channel for ${chalk.green(guild.name)}`);
        return;
      }

      const previousMessages = await channel.messages.fetch({ limit: 100 });
      const posted = previousMessages.some((msg) =>
        msg.embeds.some((embed) =>
          embed.fields.some(
            (field) =>
              field.name === 'Source' &&
              field.value === `[#${message.channel.name}](${getLink(message)})`
          )
        )
      );

      if (posted) {
        log.info('Already posted starred message');
        return;
      }

      const embed = new MessageEmbed()
        .setAuthor(
          getNickname(guild, message.author),
          message.author.avatarURL({ format: 'png' })
        )
        .setColor('GOLD')
        .setURL(getLink(message))
        .setDescription(message.content)
        .addField(
          'Source',
          `[#${message.channel.name}](${getLink(message)})`,
          true
        )
        .setFooter(
          `Posted ${message.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} ${message.createdAt.toLocaleTimeString()}`
        );

      channel.send(embed);
      analytics.trackUsage('starred', message.content);
    }
  });
};
