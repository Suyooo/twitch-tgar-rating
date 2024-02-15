import { env as envPrivate } from "$env/dynamic/private";
import { env as envPublic } from "$env/dynamic/public";
import type { Server } from "node:http";
import open from "open";
import { setupRoomCleanup, stopRoomCleanup } from "$lib/server/chat/store.js";
import { startTwitchBot, stopTwitchBot } from "$lib/server/chat/twitch.js";
import logger from "$lib/server/logger.js";
import { setupSocketIOServer, stopSocketIOServer } from "$lib/server/socketio/server.js";

export function startBackend(server: Server) {
	if (envPublic.PUBLIC_APP_URL === undefined || envPublic.PUBLIC_APP_URL === "") {
		logger.error("APP", "Environment variable PUBLIC_APP_URL is not set. Exiting.");
		process.exit(1);
	}

	logger.log("APP", `App starting at ${envPublic.PUBLIC_APP_URL}`);
	logger.debug("BACK", "Starting backend services");
	startTwitchBot();
	setupRoomCleanup();
	setupSocketIOServer(server);

	if (envPrivate.OPEN_BROWSER === "1") {
		open(envPublic.PUBLIC_APP_URL);
	}
}

export async function stopBackend() {
	logger.debug("BACK", "Stopping backend services");
	await stopTwitchBot();
	stopRoomCleanup();
	await stopSocketIOServer();
}
