import { startBot } from "$lib/server/chat.js";
import { startSocketIO } from "$lib/socketio/server.js";
import { setupRoomCleanup } from "$lib/server/store.js";

startBot();
setupRoomCleanup();
startSocketIO();
