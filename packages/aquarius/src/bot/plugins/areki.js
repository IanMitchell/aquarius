import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import { getNickname } from '@aquarius-bot/users';
import debug from 'debug';
import { Permissions } from 'discord.js';
import { randomValue } from '../../core/helpers/lists';
import { ONE_MINUTE } from '../../core/helpers/times';

const log = debug('Areki');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'areki',
  hidden: true,
  description: "A fun utility for everyone's favorite fansubber.",
  permissions: [Permissions.FLAGS.MANAGE_NICKNAMES],
};

const GOOD_JOB_MEDIA = '131816223523602432';
const AREKI = '132203481565102080';
const LOOP_DURATIONS = Array.from(
  new Array(5).fill(0),
  (value, index) => (1 + index) * ONE_MINUTE
);

async function updateNickname(aquarius) {
  const guild = aquarius.guilds.cache.get(GOOD_JOB_MEDIA);

  if (!guild) {
    return;
  }

  const check = checkBotPermissions(guild, ...info.permissions);
  const enabled = aquarius.guildManager
    .get(guild.id)
    .isCommandEnabled(info.name);

  if (check.valid && enabled) {
    const areki = await guild.members.fetch(AREKI);
    const nickname = getNickname(guild, areki);
    const match = nickname.match(/\d+/);

    if (match) {
      log("Updating Areki's nickname");

      let number = parseInt(match[0], 10);

      if (nickname.endsWith('%-slowly-depleting Ganbareki')) {
        number -= 1;
      } else if (nickname.endsWith('%-slowly-uppleting Ganbareki')) {
        number += 1;
      }

      const newName =
        number > 0 ? nickname.replace(/\d+/, number) : 'Depleted Ganbareki';

      try {
        await areki.setNickname(newName);
      } catch (error) {
        log("Error updating Areki's nickname");
        Sentry.captureException(error);
      }
    }
  }

  setTimeout(() => {
    try {
      updateNickname(aquarius);
    } catch (error) {
      log("Error checking Areki's nickname");
      Sentry.captureException(error);
    }
  }, randomValue(LOOP_DURATIONS));
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {
  aquarius.on('ready', () => {
    setTimeout(() => {
      try {
        updateNickname(aquarius);
      } catch (error) {
        log("Error starting Areki's nickname check");
        Sentry.captureException(error);
      }
    }, ONE_MINUTE);
  });
};
