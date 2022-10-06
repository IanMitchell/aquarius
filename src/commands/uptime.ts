import { SlashCommandBuilder } from "@discordjs/builders";
import { getExactTimeInterval } from "../lib/core/helpers/dates";
import { CommandArgs } from "../typedefs";

export const command = new SlashCommandBuilder()
	.setName("uptime")
	.setDescription("Displays how long the bot has been running.");

export default async function uptime({ bot }: CommandArgs) {
	bot.onSlashCommand(command, (interaction) => {
		const uptime = getExactTimeInterval(
			Date.now() - (bot.uptime ?? 0),
			Date.now()
		);
		interaction.reply(`I've been up for ${uptime}`);
	});
}
