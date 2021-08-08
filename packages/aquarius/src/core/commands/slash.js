import { Constants, MessageActionRow, MessageButton } from "discord.js";
import { getMessageContext } from "../analytics/track";
import { getBotInviteLink } from "../helpers/links";
import getLogger from "../logging/log";

// TODO: Rename
const log = getLogger("Slash");

/**
 * @typedef {import('@discordjs/builders').SlashCommandBuilder} SlashCommandBuilder
 * @typedef {import('discord.js').ApplicationCommand} ApplicationCommand
 * @typedef {import('discord.js').ApplicationCommandData} ApplicationCommandData
 * @typedef {import("discord.js").ApplicationCommandOption} ApplicationCommandOption
 * @typedef {import("discord.js").CommandInteraction} CommandInteraction
 */

/**
 * Creates a key for a slash command definition
 * @param {SlashCommandBuilder | SlashCommandBuilder[]} definition - Slash command registration definition
 * @returns {string} The key for a slash command invocation
 */
export function getSlashCommandKey(definition) {
  if (Array.isArray(definition)) {
    return definition.reduce((name, builder) => `${name}-${builder.name}`, "");
  }

  return definition.name;
}

/**
 * Serializes a Command Interaction event into a key
 * @param {CommandInteraction} interaction - Command Interaction event data
 * @returns {string} Serialized key for the Command Interaction
 */
export function getSerializedCommandInteractionKey(interaction) {
  const name = interaction.commandName;
  const group = interaction.options.getSubcommandGroup(false);
  const subcommand = interaction.options.getSubcommand(false);

  return [name, group, subcommand].filter((value) => Boolean(value)).join("-");
}

/**
 * Merges different Slash Command Builders
 * @param {SlashCommandBuilder[]} data - Slash Command Builders to merge together
 * @param {SlashCommandBuilder} base=null - Slash Command Builder to extend
 */
export function getMergedApplicationCommandData(data, base = null) {
  const command = base ?? data[0];

  const [subcommand, group] = data.slice(1, 3);

  if (group != null) {
    group.addSubcommand(subcommand);
    command.addSubcommandGroup(group);
  } else if (subcommand != null) {
    command.addSubcommand(subcommand);
  }

  return command;
}

/**
 * Checks to see if two Application Commands share the same interface
 * @param {ApplicationCommand | ApplicationCommandOption} record - The Application Command to verify
 * @param {ApplicationCommandData | ApplicationCommandOption} reference - The Application Command Data to check against
 * @returns {bool} Whether the two commands are equal
 */
export function isApplicationCommandEqual(record, reference) {
  if (
    record.name !== reference.name ||
    record.description !== reference.description ||
    record.defaultPermission !== reference.defaultPermission ||
    record.type !== reference.type
  ) {
    return false;
  }

  if (record.choices?.length !== reference.choices?.length) {
    return false;
  }

  if (!record.choices.every((choice) => reference.choices.includes(choice))) {
    return false;
  }

  if (record.options == null && reference.options == null) {
    return true;
  }

  if (record.options.length !== reference.options.length) {
    return false;
  }

  return record.options.every((option) =>
    isApplicationCommandEqual(
      option,
      reference.options.find((opt) => opt.name === option.name)
    )
  );
}

export function getSlashCommandDeprecationMessage() {
  return {
    content:
      "This command was migrated to a slash command - type `/` to see them! If you don't see any commands for Aquarius there, you may need an admin to reinvite the bot to authorize it with the slash command scope.",
    components: [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setURL(getBotInviteLink())
          .setLabel("Add Slash Command Scope")
          .setStyle(Constants.MessageButtonStyles.LINK)
      ),
    ],
  };
}

/**
 * Handles deprecated command invocations
 * @param {string} name - Name of the executed command
 * @param {import('../commands/analytics').default} analytics - Analytics object for the command
 * @returns {import('../../typedefs').CommandHandler} Command Handler
 */
export function handleDeprecatedCommand(name, analytics) {
  return (message) => {
    log.info(`Sending ${name} deprecation message`);
    message.channel.send(getSlashCommandDeprecationMessage());
    analytics.track("deprecation", name, getMessageContext(message));
  };
}
