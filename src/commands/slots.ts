import { SlashCommandBuilder } from "@discordjs/builders";
import dedent from "dedent-js";
import { randomValue } from "../lib/aquarius/list";
import { CommandArgs } from "../typedefs";

const values = [
	"🍇",
	"🍊",
	"🍐",
	"🍒",
	"🍋",
	"🍎",
	"🍌",
	"🍉",
	"🍓",
	"🥝",
	"🍍",
	"🍑",
];

export const command = new SlashCommandBuilder()
	.setName("slots")
	.setDescription("Simulates a slot roller.");

export default async function slots({ bot }: CommandArgs) {
	bot.onSlashCommand(command, (interaction) => {
		console.log("Rolling slots");
		interaction.reply(dedent`
      ${randomValue(values)} | ${randomValue(values)} | ${randomValue(values)}
    `);
	});
}
