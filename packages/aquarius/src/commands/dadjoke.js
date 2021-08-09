import Sentry from "@aquarius-bot/sentry";
import { SlashCommandBuilder } from "@discordjs/builders";
import fetch from "node-fetch";
import { handleDeprecatedCommand } from "../core/commands/slash";
import getLogger, { getInteractionMeta } from "../core/logging/log";

const log = getLogger("DadJoke");

/**
 * @deprecated
 * @type {import('../typedefs').CommandInfo}
 */
export const info = {
  name: "dadjoke",
  description: "Sends a random dad joke.",
  usage: "```@Aquarius dadjoke```",
  deprecated: true,
};

export const command = new SlashCommandBuilder()
  .setName("dadjoke")
  .setDescription("Sends a random dad joke.");

/** @type {import('../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onSlash(command, async (interaction) => {
    await interaction.deferReply();
    log.info("Sending dadjoke", getInteractionMeta(interaction));

    try {
      const response = await fetch("https://icanhazdadjoke.com/", {
        headers: {
          "Accept": "text/plain",
          "User-Agent":
            "Aquarius-V2 (https://github.com/IanMitchell/aquarius-v2)",
        },
      });

      const body = await response.text();
      interaction.editReply(body);
    } catch (error) {
      log.error(error);
      Sentry.captureException(error);

      interaction.editReply("Sorry, I wasn't able to get a dad joke!");
    }

    analytics.trackInteraction("dadjoke", interaction);
  });

  /**
   * Remove after all scopes are good
   * @deprecated
   */
  aquarius.onCommand(
    /^dadjoke$/i,
    handleDeprecatedCommand("dadjoke", analytics)
  );
};
