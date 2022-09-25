import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandArgs } from "../typedefs";

export const command = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("If the bot is online, you'll get a pong");

export default async ({ bot }: CommandArgs) => {
	bot.onSlashCommand(command, (interaction) => {
		console.log("Ping command response");

		void interaction.reply({
			content: `🏓 pong! ${bot.ws.ping}ms`,
			ephemeral: true,
		});
	});
};
