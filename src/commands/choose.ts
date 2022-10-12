import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { randomValue } from "src/lib/aquarius/list";
import { CommandArgs } from "../typedefs";

export const command = new SlashCommandBuilder()
	.setName("choose")
	.setDescription("Randomly choose from a comma separated list")
	.setDMPermission(false)
	.addStringOption(
		new SlashCommandStringOption()
			.setName("input")
			.setDescription("List of comma separated values to choose from")
			.setRequired(true)
	) as SlashCommandBuilder;

const MAX_DECIMAL_PRECISION = 20;
const RANGE_REGEX =
	/^(?<lowerBound>-?\d+(?<lowerBoundDecimal>\.\d+)?)-(?<upperBound>-?\d+(?<upperBoundDecimal>\.\d+)?)$/i;

function getChoices(input: string, delimiter: string) {
	const choices: string[] = [];

	input.split(delimiter).forEach((choice) => {
		const value = choice.trim();

		if (value) {
			choices.push(value);
		}
	});

	return choices;
}

function countDecimals(number: number) {
	if (Math.floor(number) === number && !number.toString().includes(".")) {
		return 0;
	}

	return number.toString().split(".")[1].length || 0;
}

export default async function choose({ bot }: CommandArgs) {
	bot.onSlashCommand(command, (interaction) => {
		console.log("Handling choose command");
		const input = interaction.options.getString("input", true);
		const rangeMatch = input.match(RANGE_REGEX);

		if (rangeMatch) {
			const { groups: rangeGroups } = rangeMatch;

			const min = Math.min(
				parseFloat(rangeGroups?.lowerBound ?? "0"),
				parseFloat(rangeGroups?.upperBound ?? "0")
			);
			const max = Math.max(
				parseFloat(rangeGroups?.lowerBound ?? "0"),
				parseFloat(rangeGroups?.upperBound ?? "0")
			);

			if (rangeGroups?.lowerBoundDecimal || rangeGroups?.upperBoundDecimal) {
				const decimals = Math.min(
					Math.max(
						countDecimals(parseFloat(rangeGroups.lowerBound)),
						countDecimals(parseFloat(rangeGroups.upperBound))
					),
					MAX_DECIMAL_PRECISION
				);

				interaction.reply(
					(min + Math.random() * (max - min)).toFixed(decimals)
				);
				return;
			}

			interaction.reply(
				Math.floor(min + Math.random() * (max - min + 1)).toLocaleString()
			);
			return;
		}

		// Get a choice in a list delimited by a space or comma
		let choices = getChoices(input, ",");
		if (choices.length <= 1) {
			choices = getChoices(input, " ");
		}

		if (choices.length === 0) {
			interaction.reply("There are no choices to choose from!");
			return;
		}

		interaction.reply(randomValue(choices));
	});
}
