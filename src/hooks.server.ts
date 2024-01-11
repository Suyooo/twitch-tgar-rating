import { env } from "$env/dynamic/public";
import logger from "$lib/logger.js";
import { startBot } from "$lib/server/chat.js";
import { setupRoomCleanup } from "$lib/server/store.js";
import { startSocketIO } from "$lib/socketio/server.js";

startBot();
setupRoomCleanup();
startSocketIO();

logger.log("APP", `App ready at ${env.PUBLIC_APP_URL}`);
