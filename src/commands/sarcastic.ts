import {
	SlashCommandBuilder,
	SlashCommandStringOption,
} from "@discordjs/builders";
import { CommandArgs } from "src/typedefs";

function transform(str: string) {
	return Array.from(str)
		.map((char, i) => char[`to${i % 2 ? "Upper" : "Lower"}Case`]())
		.join("");
}

export const command = new SlashCommandBuilder()
	.setName("sarcastic")
	.setDescription("Makes input text sarcastic.")
	.setDMPermission(false)
	.addStringOption(
		new SlashCommandStringOption()
			.setName("input")
			.setDescription("What message should be written sarcastically?")
			.setRequired(true)
	) as SlashCommandBuilder;

export default async function sarcastic({ bot }: CommandArgs) {
	bot.onSlashCommand(command, (interaction) => {
		console.log("Sarcastic request");
		interaction.reply(
			`${transform(
				interaction.options.getString("input", true)
			)} <:sarcastic:645031296107675662>`
		);
	});
}
