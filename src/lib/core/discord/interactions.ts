import { Interaction, InteractionType } from "discord.js";
import { getSerializedCommandInteractionKey } from "../commands";

export function getInteractionKey(interaction: Interaction) {
	switch (interaction.type) {
		case InteractionType.ApplicationCommand:
		case InteractionType.ApplicationCommandAutocomplete:
			if (interaction.isContextMenuCommand()) {
				return interaction.commandName;
			}

			return getSerializedCommandInteractionKey(interaction);
		case InteractionType.MessageComponent:
		case InteractionType.ModalSubmit:
			return interaction.customId;
		default:
			return "unknown";
	}
}
