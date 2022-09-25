import chalk from "chalk";
import { Message } from "discord.js";
import Sentry from "../lib/core/logging/sentry";
import { getError } from "../lib/core/node/error";
import { CommandArgs } from "../typedefs";

const MESSAGE_STACK_SIZE = 5;

const messageStack = new Map();

function pushMessage(message: Message) {
	const { guild, channel } = message;

	if (guild == null || channel == null) {
		return;
	}

	if (!messageStack.get(message.guildId)) {
		console.log(`Creating entry for ${chalk.green(guild.name)}`);
		const channelMap = new Map();

		guild.channels.cache
			.filter((chan) => chan.isTextBased())
			.forEach((chan) => channelMap.set(chan.id, []));

		messageStack.set(guild.id, channelMap);
	}

	if (!messageStack.get(guild.id).get(channel.id)) {
		messageStack.get(guild.id).set(channel.id, []);
	}

	messageStack.get(guild.id).get(channel.id).push(message.content);

	// Only track last couple messages
	if (messageStack.get(guild.id).get(channel.id).length > MESSAGE_STACK_SIZE) {
		messageStack.get(guild.id).get(channel.id).shift();
	}
}

function isSame(message: Message) {
	const { guild, channel } = message;

	if (guild == null || channel == null) {
		return;
	}

	if (!messageStack.get(guild.id).get(channel.id)) {
		return false;
	}

	if (
		messageStack.get(guild.id).get(channel.id).length !== MESSAGE_STACK_SIZE
	) {
		return false;
	}

	const messageSet = new Set(messageStack.get(guild.id).get(channel.id));

	if (messageSet.size === 1 && messageSet.has(message.content)) {
		return true;
	}

	return false;
}

export default async function same({ bot }: CommandArgs) {
	bot.on("messageCreate", (message) => {
		try {
			if (
				message.content === "" ||
				message.guild == null ||
				message.channel == null ||
				message.channel.isDMBased()
			) {
				return;
			}

			const channelName = message.channel.name;

			if (isSame(message)) {
				console.log(
					`Sending '${chalk.blue(message.content)}' to ${chalk.green(
						message.guild?.name
					)}#${chalk.green(message.channel.name)}`
				);

				messageStack.get(message.guildId).set(message.channel.id, []);
				message.channel.send(message.content);
			}
		} catch (err: unknown) {
			const error = getError(err);
			console.error(error.message);
			Sentry.captureException(error);
		}
	});
}
