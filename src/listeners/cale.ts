import Sentry from "../lib/core/logging/sentry";
import { getError } from "../lib/core/node/error";
import { CommandArgs } from "../typedefs";

const COMPANY_INC = "91318657375825920";
const EMOJI = "857294811199569930";
const CALE = "103635479097769984";

export default async function cale({ bot }: CommandArgs) {
	bot.on("messageCreate", (message) => {
		try {
			if (
				message.guildId === COMPANY_INC &&
				message.mentions.members?.has(CALE)
			) {
				message.react(EMOJI);
			}
		} catch (err: unknown) {
			const error = getError(err);
			console.error(error.message);
			Sentry.captureException(error);
		}
	});
}
