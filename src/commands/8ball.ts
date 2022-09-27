import {
	SlashCommandBuilder,
	SlashCommandStringOption,
} from "@discordjs/builders";
import { randomValue } from "../lib/aquarius/list";
import { CommandArgs } from "../typedefs";

const responses = [
	"It is certain",
	"It is decidedly so",
	"Without a doubt",
	"Yes, definitely",
	"You may rely on it",
	"As I see it, yes",
	"Most likely",
	"Outlook good",
	"Yes",
	"Signs point to yes",
	"Reply hazy try again",
	"Ask again later",
	"Better not tell you now",
	"Cannot predict now",
	"Concentrate and ask again",
	"Don't count on it",
	"My reply is no",
	"My sources say no",
	"Outlook not so good",
	"Very doubtful",
];

export const command = new SlashCommandBuilder()
	.setName("8ball")
	.setDescription("Outputs one of the classic 8ball responses.")
	.addStringOption(
		new SlashCommandStringOption()
			.setName("question")
			.setDescription("What do you want to ask the magic 8ball?")
			.setRequired(true)
	)
	.setDMPermission(false);

export default async function eightball({ bot }: CommandArgs) {
	bot.onSlashCommand(command, (interaction) => {
		console.log("Generating 8ball response");
		interaction.reply({
			content: `${interaction.user} asked \n> ${interaction.options.getString(
				"question",
				true
			)}\n🎱 | ${randomValue(responses)}`,
		});
	});
}
