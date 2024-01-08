import { startBot } from "$lib/server/chat.js";
import { setupRoomCleanup } from "$lib/server/store.js";

startBot();
setupRoomCleanup();
