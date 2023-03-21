import { Snowflake } from "discord.js";
import { CommandArgs } from "../typedefs";

export const RESPONSES = new Map<Snowflake, Map<string, string>>();

export default async function replyListener({ bot }: CommandArgs) {
	bot.on("ready", () => {
		console.log("Loading Reply Responses");

		bot.guilds.cache.map(async (guild) => {
			if (RESPONSES.has(guild.id)) {
				return;
			}

			RESPONSES.set(guild.id, new Map());

			const responses = await bot.database.reply.findMany({
				where: { guildId: guild.id },
			});

			if (!responses.length) {
				return;
			}

			responses.forEach((reply) => {
				RESPONSES.get(reply.guildId)?.set(reply.trigger, reply.response);
			});
		});
	});

	bot.on("messageCreate", (message) => {
		const id = message.guild?.id;

		if (!id) {
			return;
		}

		const content = message.cleanContent.trim().toLowerCase();

		if (RESPONSES.has(id) && RESPONSES.get(id)?.has(content)) {
			console.log(`Triggering reply`);

			const response = RESPONSES.get(id)?.get(content);
			message.channel.send({ content: response });
		}
	});
}
