import {
	SlashCommandBuilder,
	SlashCommandStringOption,
} from "@discordjs/builders";
import { getInputAsNumber } from "../lib/aquarius/input";
import { shuffle } from "../lib/aquarius/list";
import { CommandArgs } from "../typedefs";

export const command = new SlashCommandBuilder()
	.setName("order")
	.setDescription("This does not order - it's a holdover IRC command")
	.setDMPermission(false)
	.addStringOption(
		new SlashCommandStringOption()
			.setName("input")
			.setDescription("What value range to randomize?")
			.setRequired(true)
	) as SlashCommandBuilder;

const RANGE_REGEX = /(?<lowerBound>-?\d+)-(?<upperBound>-?\d+)$/i;
const ORDER_LIMITS = {
	VALUE: 99999999999,
	RANGE: 1024,
	RESULTS: 20,
};

function getRange(lowerBound: number, upperBound: number) {
	let results: Array<number | string> = [];
	let correctedUpperBound = upperBound;

	if (upperBound - lowerBound > ORDER_LIMITS.RANGE) {
		correctedUpperBound = lowerBound + ORDER_LIMITS.RANGE;
	}

	results = Array.from(
		new Array(correctedUpperBound - lowerBound + 1),
		(value, key) => key + lowerBound
	);

	results = shuffle(results);

	// Add notice at the end of the shuffled array
	if (results.length > ORDER_LIMITS.RESULTS) {
		results = results.splice(0, ORDER_LIMITS.RESULTS);
		results.push("and some more...");
	}

	return results;
}

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

export default async ({ bot }: CommandArgs) => {
	bot.onSlashCommand(command, (interaction) => {
		console.log("Order command response");

		const input = interaction.options.getString("input", true);
		// Check for a range
		const rangeMatch = input.match(RANGE_REGEX);

		if (rangeMatch) {
			const { groups: rangeGroups } = rangeMatch;

			const min = Math.min(
				getInputAsNumber(rangeGroups?.lowerBound) ?? 0,
				getInputAsNumber(rangeGroups?.upperBound) ?? 0
			);
			const max = Math.max(
				getInputAsNumber(rangeGroups?.lowerBound) ?? 0,
				getInputAsNumber(rangeGroups?.upperBound) ?? 0
			);

			if (min >= ORDER_LIMITS.VALUE || max >= ORDER_LIMITS.VALUE) {
				interaction.reply("Value is too high!");
				return;
			}

			const choices = getRange(min, max);
			interaction.reply(choices.join(", "));
			return;
		}

		// Get a list delimited by a space or comma
		let choices = getChoices(input, ",");
		if (choices.length <= 1) {
			choices = getChoices(input, " ");
		}

		if (choices.length === 0) {
			interaction.reply("There are no choices to randomize!");
			return;
		}

		interaction.reply(shuffle(choices).join(", "));
	});
};
