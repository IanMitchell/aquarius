import Sentry from "@aquarius-bot/sentry";
import { SlashCommandBuilder } from "@discordjs/builders";
import fetch from "node-fetch";
import { handleDeprecatedCommand } from "../core/commands/slash";
import getLogger from "../core/logging/log";

const log = getLogger("DadJoke");

const command = new SlashCommandBuilder()
  .setName("dadjoke")
  .setDescription("Sends a random dad joke.");

/** @type {import('../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onSlash(command, async (interaction) => {
    log.info("Sending dadjoke");

    try {
      const response = await fetch("https://icanhazdadjoke.com/", {
        headers: {
          "Accept": "text/plain",
          "User-Agent":
            "Aquarius-V2 (https://github.com/IanMitchell/aquarius-v2)",
        },
      });

      const body = await response.text();
      interaction.reply(body);
    } catch (error) {
      log.error(error);
      Sentry.captureException(error);

      interaction.reply("Sorry, I wasn't able to get a dad joke!");
    }

    analytics.trackInteraction("dadjoke", interaction);
  });

  /**
   * Remove after all scopes are good
   * @deprecated
   */
  aquarius.onCommand(/^dadjoke$/i, handleDeprecatedCommand(analytics));
};
