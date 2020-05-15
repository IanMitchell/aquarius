import { isBot } from '@aquarius-bot/users';
import debug from 'debug';
import { MessageEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import pkg from '../../../package.json';
import { getIconColor } from '../../core/helpers/colors';
import { getDocsLink } from '../../core/helpers/links';

const log = debug('Release');
const GITHUB_API = 'https://api.github.com/repos';

export const info = {
  name: 'release',
  hidden: true,
  description: 'Notifies guild owners about new Aquarius commands.',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.on('ready', async () => {
    const setting = await aquarius.database.setting.findOne({
      select: {
        value: true,
      },
      where: {
        key: 'LAST_RELEASE_ID',
      },
    });

    let previousVersion = 0;

    if (setting) {
      previousVersion = setting.value;
    } else {
      log('Could not find previous version setting');
    }

    const response = await fetch(`${GITHUB_API}/${pkg.repository}/releases`);
    const json = await response.json();

    if (json && json.length && json[0].id > previousVersion) {
      log('New version detected');

      const message = new MessageEmbed({
        title: 'New Release!',
        description:
          'A new version of Aquarius has been released! The changelog is below:',
        url: getDocsLink(),
        color: await getIconColor(aquarius.user.avatarURL()),
      });

      json.forEach(async (release) => {
        if (release.id > previousVersion) {
          message.addField(release.name, release.body);
        }
      });

      aquarius.guilds.cache.array().forEach((guild) => {
        log(`Alerting ${guild.name}`);
        guild.members.cache
          .filter((member) => {
            return (
              member.hasPermission(Permissions.FLAGS.ADMINISTRATOR) &&
              !isBot(member.user)
            );
          })
          .array()
          .forEach(async (member) => {
            try {
              member.send(message);
            } catch (error) {
              // Oh well
            }
          });
      });

      analytics.trackUsage('release', null, { release: json[0].id });

      aquarius.database.setting.upsert({
        update: { value: json[0].id },
        create: { key: 'LAST_RELEASE_ID', value: json[0].id },
        where: { key: 'LAST_RELEASE_ID' },
      });
    }
  });
};
