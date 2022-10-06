import {
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from "@discordjs/builders";
import {
	CommandInteraction,
	Interaction,
	MessageComponent,
	MessageComponentInteraction,
} from "discord.js";
import Application from "./bot";

declare global {
	var fetch: typeof import("undici").fetch;
}

type Bot = typeof Application;

export type CommandModule = {
	default: ({ bot }: { bot: Bot }) => unknown;
};

export type CommandArgs = {
	bot: Bot;
};

export type ActionHandler<T> = (interaction: T) => unknown;

export interface BotComponent {
	component: MessageComponent;
	handler: ActionHandler<MessageComponentInteraction>;
}

export interface BotCommand<
	T extends Interaction,
	U extends CommandBuilder = SlashCommandBuilderSequence
> {
	commands: U;
	handler: ActionHandler<T>;
}

export interface BotAutocompleteCommand<T extends CommandInteraction> {
	commands: SlashCommandBuilderDefinition;
	handler: ActionHandler<T>;
}

// export interface BotListener {}

export type SlashCommandBuilderDefinition =
	| SlashCommandBuilder
	| [SlashCommandBuilder]
	| [SlashCommandBuilder, SlashCommandSubcommandBuilder]
	| [
			SlashCommandBuilder,
			SlashCommandSubcommandGroupBuilder,
			SlashCommandSubcommandBuilder
	  ];

export type SlashCommandBuilderSequence = Exclude<
	SlashCommandBuilderDefinition,
	SlashCommandBuilder
>;

export type CommandBuilder =
	| SlashCommandBuilderSequence
	| [ContextMenuCommandBuilder];
