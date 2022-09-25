import * as Sentry from "@sentry/node";
import { CaptureContext } from "@sentry/types";
import { DMChannel, Interaction, Message } from "discord.js";
import database from "../database";
import { getError } from "../node/error";

function captureException(
	exception: any,
	captureContext?: CaptureContext
): string {
	return Sentry.captureException(exception, captureContext);
}

function getSentry() {
	if (process.env.NODE_ENV === "production") {
		Sentry.init({
			dsn: process.env.SENTRY,
			release: process.env.RAILWAY_GIT_COMMIT_SHA,
			integrations: [
				new Tracing.Integrations.Prisma({ client: database }),
				new Sentry.Integrations.Http({ tracing: true }),
			],
			tracesSampleRate: 1.0,
		});
	}

	return {
		...Sentry,
		captureException,

		withMessageScope(message: Message, fn: () => void) {
			Sentry.withScope((scope) => {
				const { tag, id } = message.author;
				scope.setUser({ username: tag, id });

				if (message.guild) {
					scope.setExtra("Guild ID", message.guild.id);
					scope.setExtra("Guild Name", message.guild.name);
					scope.setExtra("Channel ID", message.channel.id);
					scope.setExtra("Channel Type", message.channel.type);

					if (
						message.channel.isTextBased() &&
						!message.channel.partial &&
						!(message.channel instanceof DMChannel)
					) {
						scope.setExtra("Channel Name", message.channel.name);
					}
				}

				scope.setExtra("Message", message.content);
				scope.setExtra("Message ID", message.id);

				try {
					fn();
				} catch (err: unknown) {
					const error = getError(err);
					captureException(error);
				}
			});
		},

		withInteractionScope(interaction: Interaction, fn: () => void) {
			Sentry.withScope((scope) => {
				const { tag, id } = interaction.user;
				scope.setUser({ username: tag, id });

				if (interaction.guild) {
					scope.setExtra("Guild ID", interaction.guild.id);
					scope.setExtra("Guild Name", interaction.guild.name);
				}

				if (interaction.channel) {
					scope.setExtra("Channel ID", interaction.channel.id);
					scope.setExtra("Channel Type", interaction.channel.type);

					if (
						interaction.channel.isTextBased() &&
						!interaction.channel.partial &&
						!(interaction.channel instanceof DMChannel)
					) {
						scope.setExtra("Channel Name", interaction.channel.name);
					}
				}

				try {
					fn();
				} catch (err: unknown) {
					const error = getError(err);
					captureException(error);
				}
			});
		},
	};
}

export default getSentry();
