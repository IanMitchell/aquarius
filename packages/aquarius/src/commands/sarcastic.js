import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import { handleDeprecatedCommand } from "../core/commands/slash";
import getLogger, { getInteractionMeta } from "../core/logging/log";

const log = getLogger("Sarcastic");

function sarcastic(str) {
  return Array.from(str)
    .map((char, i) => char[`to${i % 2 ? "Upper" : "Lower"}Case`]())
    .join("");
}

export const command = new SlashCommandBuilder()
  .setName("sarcastic")
  .setDescription("Makes input text sarcastic.")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("input")
      .setDescription("What message should be written sarcastically?")
      .setRequired(true)
  );

/** @type {import('../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onSlash(command, (interaction) => {
    log.info("Sarcastic request", getInteractionMeta(interaction));
    interaction.reply(
      `${sarcastic(
        interaction.options.getString("input")
      )} ${aquarius.emojiList.get("spongebob")}`
    );
    analytics.trackInteraction("sarcastic", interaction);
  });

  /**
   * Remove after all scopes are good
   * @deprecated
   */
  aquarius.onCommand(
    /^sarcastic (?<string>.+)$/i,
    handleDeprecatedCommand("sarcastic", analytics)
  );
};
