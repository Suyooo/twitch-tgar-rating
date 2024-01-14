import { env } from "$env/dynamic/public";
import type { Server as HttpServer } from "node:http";
import type { Http2SecureServer } from "node:http2";
import { setupRoomCleanup } from "$lib/server/chat/store.js";
import { startBot } from "$lib/server/chat/twitch.js";
import logger from "$lib/server/logger.js";
import { setupSocketIOServer } from "$lib/server/socketio/server.js";

export default function startBackend(server: HttpServer | Http2SecureServer) {
	if (env.PUBLIC_APP_URL === undefined || env.PUBLIC_APP_URL === "") {
		logger.error("APP", "Environment variable PUBLIC_APP_URL is not set. Exiting.");
		process.exit(1);
	}

	logger.log("APP", `App starting at ${env.PUBLIC_APP_URL}`);
	logger.debug("BACK", "Starting backend services");
	startBot();
	setupRoomCleanup();
	setupSocketIOServer(server);
}
