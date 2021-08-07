import { Constants, MessageActionRow, MessageButton } from "discord.js";
import { getMessageContext } from "../analytics/track";
import { getBotInviteLink } from "../helpers/links";

/**
 * @typedef {import('@discordjs/builders').SlashCommandBuilder} SlashCommandBuilder
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

export function handleDeprecatedCommand(analytics) {
  return (message) => {
    message.channel.send(getSlashCommandDeprecationMessage());
    analytics.track("deprecation", "uptime", getMessageContext(message));
  };
}
