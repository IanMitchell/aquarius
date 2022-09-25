import type {
	FastifyInstance,
	FastifyPluginOptions,
	RawReplyDefaultExpression,
	RawRequestDefaultExpression,
} from "fastify";
import type { Server } from "http";
import {
	getTotalGuildCount,
	getTotalMemberCount,
} from "../lib/core/metrics/discord";
import { createShield } from "../lib/core/metrics/shields";

export default function shieldRoutes(
	server: FastifyInstance<
		Server,
		RawRequestDefaultExpression,
		RawReplyDefaultExpression
	>,
	options: FastifyPluginOptions,
	done: (err?: Error) => void
) {
	server.get("/shields/guilds", async (request, response) => {
		console.log("Guild requested");
		const value = await getTotalGuildCount();
		return response.send(createShield("Guilds", value.toLocaleString()));
	});

	server.get("/shields/users", async (request, response) => {
		console.log("Users requested");
		const value = await getTotalMemberCount();
		return response.send(createShield("Users", value.toLocaleString()));
	});

	done();
}
