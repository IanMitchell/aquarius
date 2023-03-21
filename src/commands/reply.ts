import {
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import dedent from "dedent-js";
import { PermissionFlagsBits } from "discord.js";
import { RESPONSES } from "src/listeners/reply";
import { CommandArgs } from "../typedefs";

export const command = new SlashCommandBuilder()
	.setName("reply")
	.setDescription("Automate replies to trigger phrases")
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.setDMPermission(false);

const addCommand = new SlashCommandSubcommandBuilder()
	.setName("add")
	.setDescription("Adds a new reply")
	.addStringOption(
		new SlashCommandStringOption()
			.setName("trigger")
			.setDescription("The trigger phrase")
			.setRequired(true)
	)
	.addStringOption(
		new SlashCommandStringOption()
			.setName("response")
			.setDescription("The response phrase")
			.setRequired(true)
	);

const listCommand = new SlashCommandSubcommandBuilder()
	.setName("list")
	.setDescription("Lists all the trigger phrases");
const removeCommand = new SlashCommandSubcommandBuilder()
	.setName("remove")
	.setDescription("Removes a reply")
	.addStringOption(
		new SlashCommandStringOption()
			.setName("trigger")
			.setDescription("The trigger phrase")
			.setRequired(true)
	);

export default async function reply({ bot }: CommandArgs) {
	bot.onSlashCommand([command, addCommand], async (interaction) => {
		if (!interaction.inCachedGuild()) {
			console.log(
				`Handled an interaction in a non-cached guild ${
					interaction.guildId ?? "[unknown]"
				}`
			);
			return interaction.reply({
				content: "Please add the bot before running this command",
				ephemeral: true,
			});
		}

		await interaction.deferReply();
		const trigger = interaction.options.getString("trigger", true);
		const response = interaction.options.getString("response", true);

		const exists = await bot.database.reply.findFirst({
			where: {
				guildId: interaction.guildId,
				trigger: trigger.toLowerCase(),
			},
		});

		if (exists) {
			interaction.editReply({
				content: "A reply with that trigger already exists!",
			});
			return;
		}

		const reply = await bot.database.reply.create({
			data: {
				guildId: interaction.guildId,
				trigger: trigger.toLowerCase(),
				response,
			},
		});

		if (!reply) {
			interaction.editReply({ content: "Sorry, something went wrong!" });
			return;
		}

		if (!RESPONSES.has(interaction.guildId)) {
			RESPONSES.set(interaction.guildId, new Map());
		}

		RESPONSES.get(interaction.guildId)?.set(trigger.toLowerCase(), response);

		interaction.editReply({ content: "Reply added" });
	});

	bot.onSlashCommand([command, removeCommand], async (interaction) => {
		if (!interaction.inCachedGuild()) {
			console.log(
				`Handled an interaction in a non-cached guild ${
					interaction.guildId ?? "[unknown]"
				}`
			);
			return interaction.reply({
				content: "Please add the bot before running this command",
				ephemeral: true,
			});
		}

		await interaction.deferReply();
		const trigger = interaction.options.getString("trigger", true);

		const response = await bot.database.reply.delete({
			where: {
				guildId_trigger: {
					guildId: interaction.guildId,
					trigger: trigger.toLowerCase(),
				},
			},
		});

		if (!response) {
			interaction.editReply({
				content: `No reply with the trigger '${trigger}' was found`,
			});
			return;
		}

		RESPONSES.get(interaction.guildId)?.delete(trigger.toLowerCase());

		interaction.editReply({ content: "Reply removed" });
	});

	bot.onSlashCommand([command, listCommand], async (interaction) => {
		if (!interaction.inCachedGuild()) {
			console.log(
				`Handled an interaction in a non-cached guild ${
					interaction.guildId ?? "[unknown]"
				}`
			);
			return interaction.reply({
				content: "Please add the bot before running this command",
				ephemeral: true,
			});
		}

		await interaction.deferReply();
		console.log("Getting list of replies");

		const replies = await bot.database.reply.findMany({
			where: {
				guildId: interaction.guildId,
			},
		});

		if (replies.length === 0) {
			interaction.editReply({ content: "No replies have been set yet!" });
			return;
		}

		const list = replies.map((reply) => `* '${reply.trigger}'`).join("\n");

		interaction.editReply({
			content: dedent`
        **__Replies__**

        ${list}
      `,
		});
	});
}
