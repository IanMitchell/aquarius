import { SlashCommandBuilder } from "@discordjs/builders";
import dedent from "dedent-js";
import { handleDeprecatedCommand } from "../core/commands/slash";
import { randomValue } from "../core/helpers/lists";
import getLogger, { getInteractionMeta } from "../core/logging/log";

const log = getLogger("Slots");

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: "slots",
  description: "Simulates a slot roller.",
  usage: "```@Aquarius slots```",
};

const values = [
  "🍇",
  "🍊",
  "🍐",
  "🍒",
  "🍋",
  "🍎",
  "🍌",
  "🍉",
  "🍓",
  "🥝",
  "🍍",
  "🍑",
];

const command = new SlashCommandBuilder()
  .setName("slots")
  .setDescription("Simulates a slot roller.");

/** @type {import('../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onSlash(command, (interaction) => {
    log.info("Rolling", getInteractionMeta(interaction));
    interaction.reply(dedent`
      ${randomValue(values)} | ${randomValue(values)} | ${randomValue(values)}
    `);

    analytics.trackInteraction("slots", interaction);
  });

  /**
   * Remove after all scopes are good
   * @deprecated
   */
  aquarius.onCommand(/^slots$/i, handleDeprecatedCommand("slots", analytics));
};
