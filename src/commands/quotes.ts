import {
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { Quote } from "@prisma/client";
import { formatDistance } from "date-fns";
import dedent from "dedent-js";
import { CommandArgs } from "../typedefs";

export const command = new SlashCommandBuilder()
	.setName("quote")
	.setDescription("Outputs one of the classic 8ball responses.")
	.setDMPermission(false);

const addCommand = new SlashCommandSubcommandBuilder()
	.setName("add")
	.setDescription("Adds a new quote")
	.addStringOption(
		new SlashCommandStringOption()
			.setName("quote")
			.setDescription("The new quote")
			.setRequired(true)
	);

const readCommand = new SlashCommandSubcommandBuilder()
	.setName("read")
	.setDescription("Reads a quote back")
	.addIntegerOption(
		new SlashCommandIntegerOption()
			.setName("number")
			.setDescription("The quote to read")
			.setRequired(true)
	);

const randomCommand = new SlashCommandSubcommandBuilder()
	.setName("random")
	.setDescription("Reads a random quote back");

function getQuoteMessage(quote: Quote) {
	const time = formatDistance(quote.createdAt, new Date(), { addSuffix: true });

	return dedent`
    *Quote ${quote.quoteId} added by ${quote.addedBy} ${time}*
    ${quote.quote}
  `;
}

export default async function quotes({ bot }: CommandArgs) {
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
		const quote = interaction.options.getString("quote", true);
		console.log("Adding quote");

		const quoteCount = await bot.database.quote.count({
			where: {
				guildId: interaction.guildId,
			},
		});

		await bot.database.quote.create({
			data: {
				guildId: interaction.guildId,
				channel: interaction?.channel?.name ?? "[unknown channel]",
				addedBy: interaction.user.username,
				quoteId: quoteCount + 1,
				quote,
			},
		});

		interaction.editReply({ content: `Added quote #${quoteCount + 1}!` });
	});

	bot.onSlashCommand([command, readCommand], async (interaction) => {
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
		const target = interaction.options.getInteger("number", true);
		console.log(`Getting quote ${target}`);

		const quote = await bot.database.quote.findUnique({
			where: {
				guildId_quoteId: {
					quoteId: target,
					guildId: interaction.guildId,
				},
			},
		});

		if (!quote) {
			interaction.editReply({
				content: `I couldn't find a quote with id #${target}`,
			});
			return;
		}

		interaction.editReply({ content: getQuoteMessage(quote) });
	});

	bot.onSlashCommand([command, randomCommand], async (interaction) => {
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
		console.log("Getting random quote");

		const quoteCount = await bot.database.quote.count({
			where: {
				guildId: interaction.guildId,
			},
		});

		if (quoteCount === 0) {
			interaction.editReply({
				content: "There are no quotes in the server yet!",
			});
			return;
		}

		const randomTarget = Math.floor(Math.random() * quoteCount);

		const quote = await bot.database.quote.findUnique({
			where: {
				guildId_quoteId: {
					quoteId: randomTarget,
					guildId: interaction.guildId,
				},
			},
		});

		if (!quote) {
			interaction.editReply({ content: "Sorry, something went wrong!" });
			return;
		}

		interaction.editReply({ content: getQuoteMessage(quote) });
	});
}
