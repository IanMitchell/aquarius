import {
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { formatDistance } from "date-fns";
import { EmbedBuilder } from "discord.js";
import leven from "leven";
import NodeCache from "node-cache";
import { getIconColor } from "../lib/aquarius/colors";
import Sentry from "../lib/core/logging/sentry";
import { CommandArgs } from "../typedefs";

const SET_TOKEN_COMMAND_ID = "123";
const setTokenCommand = new SlashCommandSubcommandBuilder()
	.setName("set_token")
	.setDescription("Set the token for the deschtimes API")
	.addStringOption(
		new SlashCommandStringOption()
			.setName("token")
			.setDescription("The token for the deschtimes API")
			.setRequired(true)
	);

const blameCommand = new SlashCommandSubcommandBuilder()
	.setName("status")
	.setDescription("View the status of a show")
	.addStringOption(
		new SlashCommandStringOption()
			.setName("name")
			.setDescription("The name of the show")
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addIntegerOption(
		new SlashCommandIntegerOption()
			.setName("episode")
			.setDescription("The episode number")
			.setRequired(false)
	);

export const command = new SlashCommandBuilder()
	.setName("deschtimes")
	.setDescription("Commands for interacting with the Deschtimes service")
	.setDMPermission(false)
	.addSubcommand(blameCommand)
	.addSubcommand(setTokenCommand) as SlashCommandBuilder;

const cache = new NodeCache({
	stdTTL: 30,
});

type ShowListRecord = {
	name: string;
	terms: Array<{
		name: string;
	}>;
};

type ShowRecord = {
	id: number;
	name: string;
	status: string;
	progress: string;
	created_at: Date;
	updated_at: Date;
	poster?: string;
	joint_groups?: Array<{
		id: number;
		name: string;
		acronym: string;
		icon?: string;
	}>;
	episodes: Array<{
		id: number;
		number: number;
		air_date: Date;
		season: string;
		released: boolean;
		updated_at: Date;

		staff: Array<{
			id: number;
			finished: boolean;
			updated_at: Date;

			position: {
				id: number;
				name: string;
				acronym: string;
			};

			member: {
				id: number;
				name: string;
				group: number;
			};
		}>;
	}>;
};

async function getShowNameAutocompleteResults(
	token: string | undefined,
	guildId: string,
	name: string
) {
	let showList = cache.get<ShowListRecord[]>(guildId);

	if (showList == null) {
		try {
			const response = await fetch(
				`https://deschtimes.com/api/v1/groups/${token}/shows.json`
			);
			const data = (await response.json()) as Record<string, unknown>;

			if (!response.ok || data?.message) {
				console.error(
					`Deschtimes Error: ${data.message ?? "Invalid Response"}`
				);
				throw new Error((data.message as string) ?? "Invalid Response");
			}

			showList = data.shows as ShowListRecord[];
			cache.set(guildId, showList);
		} catch (error: unknown) {
			console.error(error);
			Sentry.captureException(error);

			return [];
		}
	}

	const results =
		showList?.sort((a, b) => {
			const aDistance = Math.min(
				leven(a.name, name),
				...a.terms.map((term) => leven(term.name, name))
			);
			const bDistance = Math.min(
				leven(b.name, name),
				...b.terms.map((term) => leven(term.name, name))
			);
			return aDistance - bDistance;
		}) ?? [];

	return results
		.slice(0, 25)
		.map((choice) => ({ name: choice.name, value: choice.name }));
}

async function getShowEmbed(data: ShowRecord, episodeNumber: number | null) {
	let episode = null;

	// Account for Episode 0
	if (episodeNumber != null) {
		episode = data.episodes.find((ep) => ep.number === episodeNumber);
	}

	// Account for no set episode or missing episode number
	if (!episode) {
		[episode] = data.episodes
			.filter((ep) => !ep.released)
			.sort((a, b) => a.number - b.number);
	}

	const embed = new EmbedBuilder()
		.setAuthor({ name: "Deschtimes", url: "https://deschtimes.com" })
		.setColor(0x008000);

	if (data.poster) {
		const color = await getIconColor(data.poster);
		embed.setColor(color);
		embed.setThumbnail(data.poster);
	}

	if (data.status) {
		embed.setDescription(data.status);
	}

	if (!episode) {
		const [lastEpisode] = data.episodes.sort((a, b) => b.number - a.number);

		embed.setTitle(data.name);
		embed.addFields({
			name: "Finished",
			value: formatDistance(new Date(lastEpisode.updated_at), new Date(), {
				addSuffix: true,
			}),
		});

		return embed;
	}

	embed.setTitle(`${data.name} #${episode.number}`);

	if (episode.staff.length > 0) {
		embed.addFields([
			{
				name: "Status",
				value: episode.staff
					.map((staff) => {
						if (staff.finished) {
							return `~~${staff.position.acronym}~~`;
						}

						return `**${staff.position.acronym}**`;
					})
					.join(" "),
			},
		]);
	}

	const updatedDate = new Date(episode.updated_at);
	const airDate = new Date(episode.air_date);

	if (updatedDate > airDate) {
		embed.addFields([
			{
				name: "Last Update",
				value: formatDistance(updatedDate, new Date(), { addSuffix: true }),
			},
		]);
	} else if (airDate > new Date()) {
		embed.addFields([
			{
				name: "Airs",
				value: formatDistance(airDate, new Date(), { addSuffix: true }),
			},
		]);
	} else {
		embed.addFields([
			{
				name: "Aired",
				value: formatDistance(airDate, new Date(), { addSuffix: true }),
			},
		]);
	}

	return embed;
}

export default async function deschtimes({ bot }: CommandArgs) {
	const tokens = new Map<string, string>();

	bot.on("ready", async () => {
		// TODO: load all the tokens from the database
	});

	bot.onSlashCommand([command, setTokenCommand], async (interaction) => {
		const token = interaction.options.getString("token", true);
		await interaction.reply(`Set token to ${token}`);
	});

	bot.onAutocomplete([command, blameCommand], async (interaction) => {
		if (interaction.guildId == null) {
			return;
		}

		const token = tokens.get(interaction.guildId);

		if (token == null) {
			interaction.respond([]);
			return;
		}

		const value = interaction.options.getFocused();

		const results = await getShowNameAutocompleteResults(
			token,
			interaction.guildId,
			value
		);

		await interaction.respond(results);
	});

	bot.onSlashCommand([command, blameCommand], async (interaction) => {
		if (interaction.guildId == null) {
			return;
		}

		const token = tokens.get(interaction.guildId);

		if (token == null) {
			interaction.reply({
				content: `Please ask an admin to set the token with </deschtimes set_token:${SET_TOKEN_COMMAND_ID}>`,
			});
			return;
		}

		await interaction.deferReply();
		const showName = interaction.options.getString("name", true);
		const episode = interaction.options.getInteger("episode");

		try {
			const response = await fetch(
				`https://deschtimes.com/api/v1/groups/${token}/shows/${encodeURIComponent(
					showName
				)}.json`
			);
			const data = (await response.json()) as Record<string, unknown>;

			if (data.message) {
				console.error(`Error: ${data.message}`);
				await interaction.editReply(data.message);
				return;
			}

			const embed = await getShowEmbed(data as ShowRecord, episode);
			interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			Sentry.captureException(error);

			interaction.editReply(
				`Sorry, there was an unexpected problem. Please open an issue on our GitHub!`
			);
		}
	});
}

/*

/deschtimes blame
/deschtimes release
/deschtimes update

/**
**Blame**:
\`\`\`@Aquarius blame <show>\`\`\`

**Blame Future Episode**:
\`\`\`@Aquarius blame #<episode number> <show>\`\`\`

**Update Staff**
\`\`\`@Aquarius <done|undone> <position> <show>\`\`\`

**Update Future Episode**
\`\`\`@Aquarius <done|undone> <position> #<episode number> <show>\`\`\`

**Mark as Released**
\`\`\`@Aquarius release <show>\`\`\`

*/
