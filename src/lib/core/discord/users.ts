import { Guild, GuildMember, User } from "discord.js";

export async function getNickname(
	guild: Guild | null,
	user: User | GuildMember
) {
	if (user instanceof GuildMember) {
		return user.nickname ?? user.user.username;
	}

	if (guild == null) {
		return user.username;
	}

	let member: User | GuildMember = user;

	if (!(member instanceof GuildMember)) {
		member = await guild.members.fetch({ user });
	}

	return member.nickname ?? member.user.username;
}
