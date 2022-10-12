import Sentry from "../lib/core/logging/sentry";
import { getError } from "../lib/core/node/error";
import { CommandArgs } from "../typedefs";

const SERVERS = new Set([
	"91318657375825920", // Company Inc
	"815369174096412692", // Sol Sanctum
]);
const EMOJI = "857294811199569930";
const CALE = "103635479097769984";

export default async function cale({ bot }: CommandArgs) {
	bot.on("messageCreate", (message) => {
		try {
			if (
				SERVERS.has(message?.guild?.id ?? "0") &&
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
