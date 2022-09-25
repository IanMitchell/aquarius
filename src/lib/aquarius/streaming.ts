import { ActivityType, Presence } from "discord.js";

export function isStreaming(presence: Presence) {
	return (
		presence?.activities?.some((activity) => {
			return activity.type === ActivityType.Streaming;
		}) ?? false
	);
}

export function getStream(presence: Presence) {
	return presence?.activities?.find(
		(activity) => activity.type === ActivityType.Streaming
	);
}
