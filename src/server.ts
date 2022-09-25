import cors from "@fastify/cors";
import fastify from "fastify";
import Sentry from "./lib/core/logging/sentry";
import { getError } from "./lib/core/node/error";
import shieldRoutes from "./routes/shields";

const server = fastify();
void server.register(cors);
void server.register(shieldRoutes);

export default (async () => {
	try {
		const port = process.env.SERVER_PORT ?? 3000;
		console.log(`Listening on localhost:${port}`);
		await server.listen(port, "0.0.0.0");
	} catch (err: unknown) {
		const error = getError(err);
		console.error(error.message);
		Sentry.captureException(error);

		process.exit(1);
	}
})();
