import chalk from "chalk";
import { getBotInviteLink } from "../../core/helpers/links";
import getLogger, { getMessageMeta } from "../../core/logging/log";

const log = getLogger("Invite");

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: "invite",
  description: "Get a link to add me to your server",
  usage: "```@Aquarius invite```",
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^invite/i, (message) => {
    log.info(
      `Invite request in ${chalk.green(message.guild.name)}`,
      getMessageMeta(message)
    );

    message.channel.send(getBotInviteLink());
    analytics.trackUsage("invite", message);
  });
};
