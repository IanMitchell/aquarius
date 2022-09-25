import chalk from "chalk";
import { randomChance } from "../lib/aquarius/math";
import Sentry from "../lib/core/logging/sentry";
import { getError } from "../lib/core/node/error";
import { CommandArgs } from "../typedefs";

export default async function nice({ bot }: CommandArgs) {
	bot.on("messageCreate", (message) => {
		try {
			if (
				message.cleanContent.includes("69") ||
				message.cleanContent.match(/(?:(?::six:)|6️⃣) ?(?:(?::nine:)|9️⃣)/)
			) {
				console.info(`69 in ${chalk.green(message.guild?.name)}`);

				message.react("👌");

				if (randomChance(0.1)) {
					message.channel.send("nice");
				}
			}
		} catch (err: unknown) {
			const error = getError(err);
			console.error(error.message);
			Sentry.captureException(error);
		}
	});
}
