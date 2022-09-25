import {
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
} from "@discordjs/builders";
import type { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import {
	AutocompleteInteraction,
	ButtonComponent,
	ChatInputCommandInteraction,
	Client,
	ContextMenuCommandInteraction,
	Interaction,
	InteractionType,
	MessageComponentInteraction,
	MessageContextMenuCommandInteraction,
	SelectMenuComponent,
	UserContextMenuCommandInteraction,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import {
	getMergedApplicationCommandData,
	getSerializedCommandInteractionKey,
	getSlashCommandKey,
} from "./lib/core/commands";
import database from "./lib/core/database";
import { getInteractionKey } from "./lib/core/discord/interactions";
import Sentry from "./lib/core/logging/sentry";
import { getError } from "./lib/core/node/error";
import { getDirname } from "./lib/core/node/files";
import {
	ActionHandler,
	BotCommand,
	BotComponent,
	CommandModule,
	SlashCommandBuilderDefinition,
} from "./typedefs";

export class Application extends Client {
	public readonly database: PrismaClient;
	public readonly slashCommands: Map<
		string,
		BotCommand<ChatInputCommandInteraction>
	>;

	public readonly contextMenuCommands: Map<
		string,
		BotCommand<
			UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction,
			[ContextMenuCommandBuilder]
		>
	>;

	public readonly autocompleteHandlers: Map<
		string,
		BotCommand<AutocompleteInteraction>
	>;

	public readonly messageComponents: Map<string, BotComponent>;

	constructor() {
		console.log("Booting up...");
		super({
			intents: [
				// TODO: Add intents
				// IntentsBitField.Flags.Guilds,
				// IntentsBitField.Flags.GuildMembers,
				// IntentsBitField.Flags.GuildWebhooks,
				// IntentsBitField.Flags.GuildMessageReactions,
				// IntentsBitField.Flags.GuildMessages,
			],
			// allowedMentions: { parse: ["users"] },
			// partials: [Partials.GuildMember, Partials.Message, Partials.Reaction],
		});

		this.database = database;
		this.slashCommands = new Map();
		this.contextMenuCommands = new Map();
		this.autocompleteHandlers = new Map();
		this.messageComponents = new Map();

		console.log("Loading Application Commands");
		void this.loadDirectory("commands");

		console.log("Loading Message Components");
		void this.loadDirectory("components");

		console.log("Loading Application Listeners");
		void this.loadDirectory("listeners");

		this.on("ready", this.initialize);
		this.on("interactionCreate", this.handleInteraction);
		this.on("error", (error) => {
			console.error(error.message);
			Sentry.captureException(error);
		});
	}

	async initialize() {
		console.log("Initializing...");
		void this.registerApplicationCommands();
	}

	async loadDirectory(relativePath: string) {
		const transaction = Sentry.startTransaction({
			op: relativePath,
			name: "Loading",
		});

		console.log(`Loading ${relativePath}`);
		const directory = path.join(getDirname(import.meta.url), relativePath);

		fs.readdir(directory, async (err, files) => {
			if (err) {
				throw err;
			}

			const promises = [];

			for (const file of files) {
				promises.push(this.loadFile(directory, file));
			}

			return Promise.all(promises).then(() => {
				transaction.finish();
			});
		});
	}

	async loadFile(directory: string, file: string) {
		if (!file.endsWith(".js")) {
			return;
		}

		console.log(`Loading ${chalk.blue(file)}`);

		try {
			const data = (await import(path.join(directory, file))) as CommandModule;

			return data.default({
				bot: this,
			});
		} catch (err: unknown) {
			const error = getError(err);
			console.error(error.message, { file });
			Sentry.captureException(error);
			process.exit(1);
		}
	}

	getSerializedApplicationData(): RESTPostAPIApplicationCommandsJSONBody[] {
		const commands = new Map<
			string,
			SlashCommandBuilder | ContextMenuCommandBuilder
		>();

		[
			...this.slashCommands.values(),
			...this.contextMenuCommands.values(),
		].forEach((entry) => {
			const [{ name }] = entry.commands;
			if (commands.has(name)) {
				const command = commands.get(name);
				commands.set(
					name,
					getMergedApplicationCommandData(entry.commands, command)
				);
			} else {
				commands.set(name, getMergedApplicationCommandData(entry.commands));
			}
		});

		return Array.from(commands.values()).map((builder) => builder.toJSON());
	}

	async registerApplicationCommands() {
		const serializedCommands = this.getSerializedApplicationData();

		try {
			if (process.env.NODE_ENV === "production") {
				console.log("Registering Global Application Commands");
				await this.application?.commands.set(serializedCommands);
			} else {
				console.log("Registering Development Guild Application Commands");
				const target = await this.guilds.fetch(
					process.env.DEVELOPMENT_GUILD_ID!
				);
				await target.commands.set(serializedCommands);
			}
		} catch (err: unknown) {
			const error = getError(err);
			console.error(error.message, { error });
			Sentry.captureException(error);
		}
	}

	async handleInteraction(interaction: Interaction) {
		const transaction = Sentry.startTransaction({
			op: getInteractionKey(interaction),
			name: "Interaction",
		});

		switch (interaction.type) {
			case InteractionType.ApplicationCommand: {
				if (interaction.isChatInputCommand()) {
					const key = getSerializedCommandInteractionKey(interaction);
					if (this.slashCommands.has(key)) {
						try {
							await this.slashCommands.get(key)?.handler(interaction);
						} catch (err: unknown) {
							const error = getError(err);
							console.error(error.message);
							Sentry.captureException(error);
						}
					} else {
						console.error(`Unknown command interaction: ${key}`);
					}
				} else if (interaction.isContextMenuCommand()) {
					if (this.contextMenuCommands.has(interaction.commandName)) {
						try {
							await this.contextMenuCommands
								.get(interaction.commandName)
								?.handler(interaction);
						} catch (err: unknown) {
							const error = getError(err);
							console.error(error.message);
							Sentry.captureException(error);
						}
					} else {
						console.error(
							`Unknown context menu interaction: ${interaction.commandName}`
						);
					}
				}

				break;
			}

			case InteractionType.MessageComponent: {
				if (!this.messageComponents.has(interaction.customId)) {
					console.error(
						`Unknown component interaction: ${interaction.customId}`
					);
					transaction.finish();
					return;
				}

				try {
					await this.messageComponents
						.get(interaction.customId)
						?.handler(interaction);
				} catch (err: unknown) {
					const error = getError(err);
					console.error(error.message);
					Sentry.captureException(error);
				}

				break;
			}

			case InteractionType.ApplicationCommandAutocomplete: {
				const key = getSerializedCommandInteractionKey(interaction);

				if (this.autocompleteHandlers.has(key)) {
					try {
						await this.autocompleteHandlers.get(key)?.handler(interaction);
					} catch (err: unknown) {
						const error = getError(err);
						console.error(error.message);
						Sentry.captureException(error);
					}
				} else {
					console.error(`Unknown autocomplete interaction: ${key}`);
				}

				break;
			}

			default: {
				console.error(`Unknown Interaction Type ${interaction.type}`);
			}
		}

		transaction.finish();
	}

	onSlashCommand(
		command: SlashCommandBuilderDefinition,
		handler: ActionHandler<ChatInputCommandInteraction>
	) {
		this.slashCommands.set(getSlashCommandKey(command), {
			commands: Array.isArray(command) ? command : [command],
			handler,
		});
	}

	onContextMenuCommand(
		command: ContextMenuCommandBuilder,
		handler: ActionHandler<ContextMenuCommandInteraction>
	) {
		this.contextMenuCommands.set(command.name, {
			commands: [command],
			handler,
		});
	}

	onAutocomplete(
		command: SlashCommandBuilderDefinition,
		handler: ActionHandler<AutocompleteInteraction>
	) {
		this.autocompleteHandlers.set(getSlashCommandKey(command), {
			commands: Array.isArray(command) ? command : [command],
			handler,
		});
	}

	onMessageComponent(
		component: ButtonComponent | SelectMenuComponent,
		handler: ActionHandler<MessageComponentInteraction>
	) {
		if (component.customId != null) {
			this.messageComponents.set(component.customId, {
				component,
				handler,
			});
		}
	}
}

const bot = (() => {
	try {
		const client = new Application();
		client.login(process.env.TOKEN).catch((err: unknown) => {
			const error = getError(err);
			console.error(error.message);
			process.exit(1);
		});

		return client;
	} catch (err: unknown) {
		const error = getError(err);
		console.error(error.message);
		process.exit(1);
	}
})();
export default bot;
