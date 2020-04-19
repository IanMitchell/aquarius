import { getLink } from '@aquarius/messages';
import { getNickname } from '@aquarius/users';
import debug from 'debug';
import { MessageEmbed, Permissions } from 'discord.js';

const log = debug('Starred');

export const info = {
  name: 'starred',
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
    let val = parseInt(settings.get(guild.id, 'amount'), 10);

    if (Number.isNaN(val)) {
      val = DEFAULT_AMOUNT;
    }

    return Math.max(1, val);
  };

  aquarius.on('messageReactionAdd', async (messageReaction) => {
    const { message } = messageReaction;
    const { guild } = message;

    if (messageReaction.emoji.name !== '⭐') {
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
        return;
      }

      if (messageReaction.count < getAmount(guild)) {
        return;
      }

      const channel = guild.channels.find(
        (chan) => chan.name === settings.get(guild.id, 'channel')
      );

      if (!channel) {
        const errorMsg =
          "Hey! Unfortunately I can't find a channel to post starred messages to. Please have an admin DM me with `set starred channel <name>` to fix this!";

        const previousMessages = await message.channel.messages.fetch({
          limit: 100,
        });

        if (!previousMessages.some((msg) => msg.content === errorMsg)) {
          message.channel.send(errorMsg);
        }

        log(`Could not find channel for ${guild.name}`);
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
        return;
      }

      const embed = new MessageEmbed()
        .setAuthor(getNickname(guild, message.author), message.author.avatarURL)
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
