import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import { Permissions } from 'discord.js';
import getLogger from '../../core/logging/log';

const log = getLogger('nbk');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'nbk',
  hidden: true,
  description: "A fun utility for everyone's favorite brit.",
  permissions: [Permissions.FLAGS.MANAGE_NICKNAMES],
};

const TORN_DEN = '341011858830131201';
const NBK_ID = '168818976330219520';

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {
  aquarius.on('guildMemberAdd', async (member) => {
    try {
      if (member.id === NBK_ID && member.guild.id === TORN_DEN) {
        const guild = await aquarius.guilds.fetch(TORN_DEN);

        if (!guild) {
          return;
        }

        const check = checkBotPermissions(guild, ...info.permissions);
        const enabled = aquarius.guildManager
          .get(guild.id)
          .isCommandEnabled(info.name);

        if (check.valid && enabled) {
          member.setNickname('nbk');
          log.info("Updating nbk's nickname");
        }
      }
    } catch (error) {
      log.error("Error updating nbk's nickname");
      Sentry.captureException(error);
    }
  });
};
