import { checkBotPermissions } from '@aquarius-bot/permissions';
import { getNickname } from '@aquarius-bot/users';
import chalk from 'chalk';
import dedent from 'dedent-js';
import { MessageEmbed, Permissions } from 'discord.js';
import pluralize from 'pluralize';
import pkg from '../../../package.json';
import { getGitHubLink, getVanityBotLink } from '../../core/helpers/links';
import getLogger, { getMessageMeta } from '../../core/logging/log';
import {
  getTotalGuildCount,
  getTotalUserCount,
} from '../../core/metrics/discord';
import { getResourceUsage } from '../../core/metrics/resources';

const log = getLogger('Info');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'info',
  description: 'Displays basic information about Aquarius.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius info```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^info/i, async (message) => {
    log.info(
      `Request in ${chalk.green(message.guild.name)}`,
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

    const guilds = getTotalGuildCount();
    const channels = aquarius.channels.cache.reduce((value, channel) => {
      if (channel.type === 'text' || channel.type === 'voice') {
        return value + 1;
      }

      return value;
    }, 0);

    const users = getTotalUserCount();

    const metrics = await getResourceUsage();

    const nickname = getNickname(message.guild, aquarius.user);

    const embed = new MessageEmbed()
      .setTitle('Aquarius')
      .setColor(0x008000)
      .setURL(getGitHubLink())
      .setDescription(
        `You can add me to your server by clicking this link: ${getVanityBotLink()}`
      )
      .setThumbnail(aquarius.user.displayAvatarURL({ format: 'png' }))
      .addField('Developer', 'Desch#3091')
      .addField(
        'Stats',
        dedent`
        ${guilds} ${pluralize('Guild', guilds)}
        ${channels} ${pluralize('Channel', channels)}
        ${users} ${pluralize('User', users)}
      `,
        true
      )
      .addField(
        'Metrics',
        dedent`
        Uptime: ${metrics.uptime}
        Memory: ${metrics.memory}
        CPU: ${metrics.cpu}
      `,
        true
      )
      .addField(
        'Need Help?',
        'Type `@Aquarius help`'.replace(/Aquarius/, nickname)
      )
      .addField(
        'Need Support?',
        'Type `@Aquarius support`'.replace(/Aquarius/, nickname),
        true
      )
      .addField(
        'Want to add me to your server?',
        'Type `@Aquarius invite`'.replace(/Aquarius/, nickname),
        true
      )
      .setFooter(`Version: ${pkg.version} | Server Donations: $IanMitchel1`);

    message.channel.send(embed);

    analytics.trackUsage('info', message);
  });
};
