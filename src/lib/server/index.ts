import { env } from "$env/dynamic/public";
import type { Server } from "node:http";
import { setupRoomCleanup, stopRoomCleanup } from "$lib/server/chat/store.js";
import { startTwitchBot, stopTwitchBot } from "$lib/server/chat/twitch.js";
import logger from "$lib/server/logger.js";
import { setupSocketIOServer, stopSocketIOServer } from "$lib/server/socketio/server.js";

export function startBackend(server: Server) {
	if (env.PUBLIC_APP_URL === undefined || env.PUBLIC_APP_URL === "") {
		logger.error("APP", "Environment variable PUBLIC_APP_URL is not set. Exiting.");
		process.exit(1);
	}

	logger.log("APP", `App starting at ${env.PUBLIC_APP_URL}`);
	logger.debug("BACK", "Starting backend services");
	startTwitchBot();
	setupRoomCleanup();
	setupSocketIOServer(server);
}

export async function stopBackend() {
	logger.debug("BACK", "Stopping backend services");
	await stopTwitchBot();
	stopRoomCleanup();
	await stopSocketIOServer();
}
