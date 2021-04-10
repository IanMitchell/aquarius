import { checkBotPermissions } from '@aquarius-bot/permissions';
import chalk from 'chalk';
import { Permissions } from 'discord.js';
import { guildEmbed } from '../../core/helpers/embeds';
import getLogger from '../../core/logging/log';

const log = getLogger('Notification');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'notification',
  hidden: true,
  description: 'Alerts the bot owner to events or problems with the bot.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.on('guildCreate', async (guild) => {
    log.info(
      `Joined Server ${chalk.green(guild.name)} (${chalk.green(
        guild.memberCount
      )} members)`
    );
    const channel = await aquarius.channels.fetch(aquarius.config.home.channel);
    const check = checkBotPermissions(channel.guild, ...info.permissions);

    if (!check.valid) {
      log.warn('Invalid permissions');
      return;
    }

    const embed = await guildEmbed(guild);
    embed.setColor('2ECC40');

    channel.send('**Joined Server**', embed);

    analytics.trackUsage('guild join', null, {
      guildId: guild.id,
      guildName: guild.name,
    });
  });

  aquarius.on('guildDelete', async (guild) => {
    log.info(
      `Left Server ${chalk.green(guild.name)} (${chalk.green(
        guild.memberCount
      )} members)`
    );
    const channel = await aquarius.channels.fetch(aquarius.config.home.channel);
    const check = checkBotPermissions(channel.guild, ...info.permissions);

    if (!check.valid) {
      log.warn('Invalid permissions');
      return;
    }

    const embed = await guildEmbed(guild);
    embed.setColor('FF4136');

    channel.send('**Left Server**', embed);

    analytics.trackUsage('guild leave', null, {
      guildId: guild.id,
      guildName: guild.name,
    });
  });
};
