import { isBot } from '@aquarius-bot/users';
import chalk from 'chalk';
import { MessageEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import pkg from '../../../package.json';
import { getIconColor } from '../../core/helpers/colors';
import { getDocsLink } from '../../core/helpers/links';
import getLogger from '../../core/logging/log';

const log = getLogger('Release');
const GITHUB_API = 'https://api.github.com/repos';

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'release',
  hidden: true,
  description: 'Notifies guild owners about new Aquarius commands.',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.on('ready', async () => {
    const setting = await aquarius.database.setting.findUnique({
      select: {
        value: true,
      },
      where: {
        key: 'LAST_RELEASE_ID',
      },
    });

    const previousVersion = setting?.value?.version ?? 0;
    const response = await fetch(`${GITHUB_API}/${pkg.repository}/releases`);
    const json = await response.json();

    if (json?.length && json[0].id > previousVersion) {
      log.info('New version detected');

      const message = new MessageEmbed({
        title: 'New Release!',
        description:
          'A new version of Aquarius has been released! The changelog is below:',
        url: getDocsLink(),
        color: await getIconColor(aquarius.user.avatarURL({ format: 'png' })),
      });

      json.forEach(async (release) => {
        if (release.id > previousVersion) {
          message.addField(release.name, release.body);
        }
      });

      // TODO: Rewrite using collection native methods
      Array.from(aquarius.guilds.cache.values()).forEach((guild) => {
        log.info(`Alerting ${chalk.green(guild.name)}`);
        Array.from(
          guild.members.cache
            .filter((member) => {
              return (
                member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
                !isBot(member.user)
              );
            })
            .values()
        ).forEach(async (member) => {
          try {
            member.send(message);
          } catch (error) {
            // Oh well
          }
        });
      });

      await aquarius.database.setting.upsert({
        where: {
          key: 'LAST_RELEASE_ID',
        },
        create: {
          key: 'LAST_RELEASE_ID',
          value: {
            version: json[0].id,
          },
        },
        update: {
          value: {
            version: json[0].id,
          },
        },
      });

      analytics.trackUsage('release', null, { release: json[0].id });
    }
  });
};
