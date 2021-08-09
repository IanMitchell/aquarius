import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import dedent from "dedent-js";
import morse from "morse";
import { handleDeprecatedCommand } from "../core/commands/slash";
import getLogger, { getInteractionMeta } from "../core/logging/log";

const log = getLogger("Morse");

/**
 * @deprecated
 * @type {import('../typedefs').CommandInfo}
 */
export const info = {
  name: "morse",
  description: "Encode or decode morse code.",
  usage: dedent`
  To encode a message:
  \`\`\`@Aquarius morse encode <message>\`\`\`
  To decode a message:
  \`\`\`@Aquarius morse decode <message>\`\`\`
  `,
  deprecated: true,
};

export const command = new SlashCommandBuilder()
  .setName("morse")
  .setDescription("Encode or decode morse code.");

const commandEncode = new SlashCommandSubcommandBuilder()
  .setName("encode")
  .setDescription("Encodes a morse sequence")
  .addStringOption((input) =>
    input.setName("input").setDescription("Input string").setRequired(true)
  );

const commandDecode = new SlashCommandSubcommandBuilder()
  .setName("decode")
  .setDescription("Decodes a morse sequence")
  .addStringOption((input) =>
    input.setName("morse").setDescription("Morse sequence").setRequired(true)
  );

/** @type {import('../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onSlash([command, commandEncode], (interaction) => {
    const input = interaction.options.getString("input");

    log.info(`Encoding "${input}"`, getInteractionMeta(interaction));
    interaction.reply(morse.encode(input));
    analytics.trackInteraction("encode", interaction);
  });

  aquarius.onSlash([command, commandDecode], (interaction) => {
    const input = interaction.options.getString("morse");

    log.info(`Decoding "${input}"`, getInteractionMeta(interaction));
    interaction.reply(morse.decode(input));
    analytics.trackInteraction("decode", interaction);
  });

  /**
   * @deprecated
   */
  aquarius.onCommand(
    /^morse encode (?<input>.+)$/i,
    handleDeprecatedCommand("morse-encode", analytics)
  );

  /**
   * @deprecated
   */
  aquarius.onCommand(
    /^morse decode (?<input>.+)$/i,
    handleDeprecatedCommand("morse-decode", analytics)
  );
};
