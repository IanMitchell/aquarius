import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import { handleDeprecatedCommand } from "../core/commands/slash";
import { randomValue } from "../core/helpers/lists";
import getLogger, { getInteractionMeta } from "../core/logging/log";

const log = getLogger("8ball");

const responses = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes, definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
  "Reply hazy try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
];

export const command = new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("Outputs one of the classic 8ball responses.")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("question")
      .setDescription("What do you want to ask the magic 8ball?")
      .setRequired(true)
  );

const component = new MessageButton()
  .setCustomId("8ball")
  .setLabel("Try again")
  .setStyle("SECONDARY")
  .setEmoji("🎱");

/** @type {import('../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // aquarius.onSlash(info, (interaction) => {});
  // aquarius.onSlash([cmd, info], (interaction) => {});
  // aquarius.onSlash([cmd, group, info], (interaction) => {});
  // aquarius.onComponent(component, (interaction) => {});

  aquarius.onSlash(command, (interaction) => {
    log.info("Generating response", getInteractionMeta(interaction));
    interaction.reply({
      content: `🎱 | ${randomValue(responses)}`,
      components: [new MessageActionRow().addComponents(component)],
    });

    analytics.trackInteraction("8ball", interaction);
  });

  aquarius.onComponent(component, (interaction) => {
    log.info("Generating response", getInteractionMeta(interaction));
    interaction.message.edit({
      content: `🎱 | ${randomValue(responses)}`,
      components: [new MessageActionRow().addComponents(component)],
    });

    analytics.trackInteraction("reroll", interaction);
  });

  /**
   * Remove after all scopes are good
   * @deprecated
   */
  aquarius.onCommand(
    /^8ball .+$/i,
    handleDeprecatedCommand("8ball", analytics)
  );
};
