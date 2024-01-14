import type { Server as HttpServer } from "node:http";
import type { Http2SecureServer } from "node:http2";
import { Server } from "socket.io";
import { endPoll, getPollVotes, startPoll } from "$lib/server/chat/store.js";
import logger from "$lib/server/logger.js";
import type { ClientToServerEvents, ServerToClientEvents } from "$lib/socketio/events.js";

let io: Server<ClientToServerEvents, ServerToClientEvents> | undefined = undefined;

export function setupSocketIOServer(httpServer: HttpServer | Http2SecureServer) {
	if (io !== undefined) return;
	io = new Server(httpServer, {
		serveClient: false,
	});

	io.on("connection", (socket) => {
		const roomCode = Array.isArray(socket.handshake.query.roomCode)
			? socket.handshake.query.roomCode[0]
			: socket.handshake.query.roomCode;
		if (roomCode === undefined || roomCode.length === 0) {
			socket.disconnect(true);
			return;
		}
		const isControl = socket.handshake.query.isControl === "y";

		socket.join(roomCode);
		logger.debug("SIO", `${socket.id} (${isControl ? "control" : "display"}) connected to room ${roomCode}`);

		socket.emit("initial-state", getPollVotes(roomCode));

		if (isControl) {
			socket.on("poll-start", async (channels, callback) => {
				logger.debug(
					"SIO",
					socket.id + " wants to start a poll on " + roomCode + ", channels " + channels.toString()
				);
				if (!Array.isArray(channels) || channels.length === 0 || channels.length > 10) {
					callback({ error: "Invalid channel array" });
				}

				try {
					await startPoll(roomCode, new Set<string>(channels));
					socket.to(roomCode).emit("poll-started");
					callback({ error: null });
				} catch (e: any) {
					logger.error("SIO", "Handling poll-start failed: " + (e.message ?? e));
					if (e.message === "Rate Limit") {
						callback({ error: "Rate Limit" });
					} else {
						callback({ error: "Internal error" });
					}
				}
			});

			socket.on("poll-end", async (callback) => {
				logger.debug("SIO", socket.id + " wants to end a poll on " + roomCode);

				try {
					const finalResult = getPollVotes(roomCode);
					if (finalResult === undefined) {
						callback({ error: "Poll does not exist" });
						return;
					}

					await endPoll(roomCode);
					socket.to(roomCode).emit("poll-ended", finalResult);
					callback({ error: null, finalResult });
				} catch (e: any) {
					logger.error("SIO", "Handling poll-end failed: " + (e.message ?? e));
					callback({ error: "Internal error" });
				}
			});

			socket.on("overlay-move", async (num, callback) => {
				logger.debug("SIO", socket.id + " wants to move the overlay for " + roomCode + " to position " + num);
				if (num !== 0 && num !== 1 && num !== 2) {
					callback({ error: "Invalid position" });
					return;
				}

				try {
					socket.to(roomCode).emit("overlay-moved", num);
					callback({ error: null });
				} catch (e: any) {
					logger.error("SIO", "Handling overlay-move failed: " + (e.message ?? e));
					callback({ error: "Internal error" });
				}
			});
		}
	});

	logger.log("SIO", "Socket.IO started");
}

export async function stopSocketIOServer() {
	io?.disconnectSockets(true);
	io = undefined;
}

export function broadcast<E extends keyof ServerToClientEvents>(
	roomCode: string,
	event: E,
	...args: Parameters<ServerToClientEvents[E]>
) {
	if (io === undefined) return;
	io.to(roomCode).emit(event, ...args);
}
