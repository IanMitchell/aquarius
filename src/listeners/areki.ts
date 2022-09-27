import Sentry from "../lib/core/logging/sentry";

import { Application } from "../bot";
import { getInputAsNumber } from "../lib/aquarius/input";
import { randomValue } from "../lib/aquarius/list";
import { ONE_MINUTE } from "../lib/aquarius/time";
import { getNickname } from "../lib/core/discord/users";
import { CommandArgs } from "../typedefs";

const GOOD_JOB_MEDIA = "131816223523602432";
const AREKI = "132203481565102080";
const LOOP_DURATIONS = Array.from(
	new Array(5).fill(0),
	(value, index) => (1 + index) * ONE_MINUTE
);

async function updateNickname(bot: Application) {
	const guild = await bot.guilds.fetch(GOOD_JOB_MEDIA);

	if (!guild) {
		return;
	}

	const areki = await guild.members.fetch({ user: AREKI });
	const nickname = await getNickname(guild, areki);
	const match = nickname.match(/\d+/);

	if (match) {
		console.info("Updating Areki's nickname");
		let number = getInputAsNumber(match[0]) ?? 0;

		if (nickname.endsWith("%-slowly-depleting Ganbareki")) {
			number -= 1;
		} else if (nickname.endsWith("%-slowly-uppleting Ganbareki")) {
			number += 1;
		}

		const newName =
			number > 0
				? nickname.replace(/\d+/, number.toString())
				: "Depleted Ganbareki";

		try {
			await areki.setNickname(newName);
		} catch (error) {
			console.error("Error updating Areki's nickname");
			Sentry.captureException(error);
		}
	}

	setTimeout(() => {
		try {
			updateNickname(bot);
		} catch (error) {
			console.error("Error checking Areki's nickname");
			Sentry.captureException(error);
		}
	}, randomValue(LOOP_DURATIONS));
}

export default async function areki({ bot }: CommandArgs) {
	bot.on("ready", () => {
		setTimeout(() => {
			try {
				updateNickname(bot);
			} catch (error) {
				console.error("Error starting Areki's nickname check");
				Sentry.captureException(error);
			}
		}, ONE_MINUTE);
	});
}
