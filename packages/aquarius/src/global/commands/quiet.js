import Sentry from '@aquarius-bot/sentry';
import { messageTriggered } from '@aquarius-bot/triggers';
import debug from 'debug';
import dedent from 'dedent-js';
import pluralize from 'pluralize';
import { ONE_MINUTE } from '../../core/helpers/times';
import { MUTE_DURATION } from '../../core/settings/guild-settings';

const log = debug('Quiet');

export const info = {
  name: 'quiet',
  description: 'Tell Aquarius to go inactive for ten minutes [Admin Only].',
  usage: dedent`
    **To Mute:**
    \`\`\`@Aquarius quiet\`\`\`

    **To Unmute:**
    \`\`\`@Aquarius quiet stop\`\`\`
  `,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // Convert to minutes
  const minutes = MUTE_DURATION / ONE_MINUTE;
  const duration = `${minutes} ${pluralize('minute', minutes)}`;

  aquarius.onCommand(/^quiet$/i, (message) => {
    if (aquarius.permissions.isAdmin(message.guild, message.author)) {
      log(`Quiet request in ${message.guild.name}`);
      aquarius.guildManager.get(message.guild.id).muteGuild();
      message.channel.send(`Muting myself for ${duration}!`);
      analytics.trackUsage('start', message);
    }
  });

  // The one case we need to break out of our APIs, since
  // they don't trigger when a guild is in a muted state
  aquarius.on('message', (message) => {
    Sentry.configureMessageScope(message);

    if (
      messageTriggered(message, /^quiet (?:stop|end)$/i) &&
      aquarius.permissions.isAdmin(message.guild, message.author)
    ) {
      log(`Quiet end request in ${message.guild.name}`);
      aquarius.guildManager.get(message.guild.id).unMuteGuild();
      message.channel.send("I've unmuted myself!");
      analytics.trackUsage('stop', message);
    }
  });
};
