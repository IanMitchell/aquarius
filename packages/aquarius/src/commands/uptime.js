import { SlashCommandBuilder } from "@discordjs/builders";
import { handleDeprecatedCommand } from "../core/commands/slash";
import { getExactTimeInterval } from "../core/helpers/dates";
import getLogger, { getInteractionMeta } from "../core/logging/log";

const log = getLogger("Uptime");

export const command = new SlashCommandBuilder()
  .setName("uptime")
  .setDescription("Displays how long the bot has been running.");

/** @type {import('../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onSlash(command, (interaction) => {
    log.info("Uptime Requested", getInteractionMeta(interaction));
    const uptime = getExactTimeInterval(
      Date.now() - aquarius.uptime,
      Date.now()
    );
    interaction.reply(`I've been up for ${uptime}`);

    analytics.trackInteraction("uptime", interaction);
  });

  /**
   * Remove after all scopes are good
   * @deprecated
   */
  aquarius.onCommand(/^uptime/i, handleDeprecatedCommand("uptime", analytics));
};
