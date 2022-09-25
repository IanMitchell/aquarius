import Sentry from "../lib/core/logging/sentry";
import { getError } from "../lib/core/node/error";
import { CommandArgs } from "../typedefs";

const TORN_DEN = "341011858830131201";
const NBK_ID = "168818976330219520";

export default async function nbk({ bot }: CommandArgs) {
	bot.on("guildMemberAdd", async (member) => {
		try {
			if (member.id === NBK_ID && member.guild.id === TORN_DEN) {
				const guild = await bot.guilds.fetch(TORN_DEN);

				if (!guild) {
					return;
				}

				console.log("Updating nbk's nickname");
				member.setNickname("nbk");
			}
		} catch (err: unknown) {
			const error = getError(err);
			console.error(error.message);
			Sentry.captureException(error);
		}
	});
}
