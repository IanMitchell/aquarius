import { isBot } from '@aquarius/messages';
import debug from 'debug';
import Discord from 'discord.js';
import fetch from 'node-fetch';
import pkg from '../../../package.json';
import { getIconColor } from '../../core/helpers/colors';
import { getDocsLink } from '../../core/helpers/links';

// CJS / ESM compatibility
const { Permissions, MessageEmbed } = Discord;

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
    const setting = await aquarius.database
      .collection('settings')
      .doc('LAST_RELEASE_ID')
      .get();
    let previousVersion = setting.exists && setting.data();

    if (!previousVersion) {
      log('Could not find previous version setting');
      previousVersion = { value: 0 };
    }

    const response = await fetch(`${GITHUB_API}/${pkg.repository}/releases`);
    const json = await response.json();

    if (json && json.length && json[0].id > previousVersion.value) {
      log('New version detected');

      const message = new MessageEmbed({
        title: 'New Release!',
        description:
          'A new version of Aquarius has been released! The changelog is below:',
        url: getDocsLink(),
        color: await getIconColor(aquarius.user.avatarURL()),
      });

      json.forEach(async (release) => {
        if (release.id > previousVersion.value) {
          message.addField(release.name, release.body);
        }
      });

      aquarius.guilds.array().forEach((guild) => {
        log(`Alerting ${guild.name}`);
        guild.members
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

      aquarius.database.collection('settings').doc('LAST_RELEASE_ID').set({
        value: json[0].id,
      });
    }
  });
};
