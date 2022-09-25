import {
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from "@discordjs/builders";
import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
} from "discord.js";
import { CommandBuilder, SlashCommandBuilderDefinition } from "../../typedefs";

export function getSlashCommandKey(definition: SlashCommandBuilderDefinition) {
	if (Array.isArray(definition)) {
		return definition.map((component) => component.name).join(".");
	}

	return definition.name;
}

export function getSerializedCommandInteractionKey(
	interaction:
		| ChatInputCommandInteraction
		| AutocompleteInteraction
		| ContextMenuCommandInteraction
) {
	const name = interaction.commandName;

	if (interaction.isContextMenuCommand()) {
		return name;
	}

	const group = interaction.options.getSubcommandGroup(false);
	const subcommand = interaction.options.getSubcommand(false);

	return [name, group, subcommand].filter((value) => Boolean(value)).join(".");
}

export function getMergedApplicationCommandData(
	data: CommandBuilder,
	base: ContextMenuCommandBuilder | SlashCommandBuilder | null = null
) {
	const command = base ?? data[0];

	if (command instanceof ContextMenuCommandBuilder) {
		return command;
	}

	const [subcommand, group] = data.slice(1, 3);

	if (
		group != null &&
		group instanceof SlashCommandSubcommandGroupBuilder &&
		subcommand instanceof SlashCommandSubcommandBuilder
	) {
		group.addSubcommand(subcommand);
		command.addSubcommandGroup(group);
	} else if (
		subcommand != null &&
		subcommand instanceof SlashCommandSubcommandBuilder
	) {
		command.addSubcommand(subcommand);
	}

	return command;
}
