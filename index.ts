import dotenv from "dotenv";
import Sentry from "./src/lib/core/logging/sentry";
import { getError } from "./src/lib/core/node/error";

dotenv.config({ path: "../../../.env" });

async function initialize() {
	try {
		console.log("Loading Bot");
		await import("./src/bot");

		console.log("Starting Server");
		await import("./src/server");
	} catch (err: unknown) {
		const error = getError(err);
		console.error(error.message);
		Sentry.captureException(error);
		process.exit(1);
	}
}

void initialize();
