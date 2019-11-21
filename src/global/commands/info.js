import debug from 'debug';
import dedent from 'dedent-js';
import pluralize from 'pluralize';
import { RichEmbed, Permissions } from 'discord.js';
import pkg from '../../../package.json';
import { getVanityBotLink, getGitHubLink } from '../../lib/helpers/links.js';
import { getResourceUsage } from '../../lib/metrics/resources.js';
import { getTotalGuildCount } from '../../lib/metrics/guilds.js';
import { getTotalUserCount } from '../../lib/metrics/users.js';

const log = debug('Info');

export const info = {
  name: 'info',
  description: 'Displays basic information about Aquarius.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius info```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^info/i, async message => {
    log(`Request in ${message.guild.name}`);

    const check = aquarius.permissions.check(
      message.guild,
      ...info.permissions
    );

    if (!check.valid) {
      log('Invalid permissions');
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    aquarius.loading.start(message.channel);

    const guilds = getTotalGuildCount();
    const channels = aquarius.channels.reduce((value, channel) => {
      if (channel.type === 'text' || channel.type === 'voice') {
        return value + 1;
      }

      return value;
    }, 0);

    const users = getTotalUserCount();

    const metrics = await getResourceUsage();

    const embed = new RichEmbed()
      .setTitle('Aquarius')
      .setColor(0x008000)
      .setURL(getGitHubLink())
      .setDescription(
        `You can add me to your server by clicking this link: ${getVanityBotLink()}`
      )
      .setThumbnail(aquarius.user.displayAvatarURL)
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
      .addField('Need Help?', 'Type `@Aquarius help`')
      .setFooter(`Version: ${pkg.version} | Server Donations: $IanMitchel1`);

    message.channel.send(embed);

    aquarius.loading.stop(message.channel);

    analytics.trackUsage('info', message);
  });
};
