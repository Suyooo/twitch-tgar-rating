import { env } from "$env/dynamic/public";
import logger from "$lib/logger.js";
import { startBot } from "$lib/server/chat.js";
import { setupRoomCleanup } from "$lib/server/store.js";
import { startSocketIO } from "$lib/socketio/server.js";

if (env.PUBLIC_APP_URL === undefined || env.PUBLIC_APP_URL === "") {
	logger.error("APP", "Environment variable PUBLIC_APP_URL is not set. Exiting.");
	process.exit(1);
}

logger.log("APP", `App starting at ${env.PUBLIC_APP_URL}`);

startBot();
setupRoomCleanup();
startSocketIO();
