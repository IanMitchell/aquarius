import { checkBotPermissions, isGuildAdmin } from '@aquarius-bot/permissions';
import chalk from 'chalk';
import dedent from 'dedent-js';
import { Permissions } from 'discord.js';
import pluralize from 'pluralize';
import { guildEmbed } from '../../core/helpers/embeds';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Guild');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'guild',
  description: 'Displays basic information about your server.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius guild```',
};

function formatGuild(guild, idx) {
  const members = `${guild.memberCount} ${pluralize(
    'Member',
    guild.memberCount
  )}`;
  return `${idx + 1}. ${guild.name} -- *(${members})*\n`;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^(?:server|guild)$/i, async (message) => {
    log.info(
      `Info for ${chalk.green(message.guild.name)}`,
      getMessageMeta(message)
    );

    const check = checkBotPermissions(message.guild, ...info.permissions);

    if (!check.valid) {
      log.warn('Invalid permissions', getMessageMeta(message));
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    const { guild } = message;
    const admin = await isGuildAdmin(guild, guild.me);

    const embed = await guildEmbed(guild, {
      title: 'Aquarius',
      content: dedent`**Admin:** ${admin ? 'Yes' : 'No'}`,
    });

    message.channel.send({ embeds: [embed] });

    analytics.trackUsage('stats', message);
  });

  // TODO: Switch to slash command
  // TODO: Broken
  aquarius.onCommand(
    /(?:server|guild) info (?<name>.+)/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotOwner(message.author)) {
        log.info(
          `Specific request for ${chalk.blue(groups.name)}`,
          getMessageMeta(message)
        );

        const check = checkBotPermissions(message.guild, ...info.permissions);

        if (!check.valid) {
          log.warn('Invalid permissions', getMessageMeta(message));
          message.channel.send(
            aquarius.permissions.getRequestMessage(check.missing)
          );
          return;
        }

        const guild = aquarius.guilds.cache.find(
          (server) => server.name === groups.name
        );

        if (guild) {
          const embed = await guildEmbed(guild);
          message.channel.send({ embeds: [embed] });
        } else {
          message.channel.send("Sorry, I couldn't find that guild!");
        }

        analytics.trackUsage('lookup', message);
      }
    }
  );
};
