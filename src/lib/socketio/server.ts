import { env } from "$env/dynamic/public";
import { Server } from "socket.io";
import { endPoll, getPollVotes, startPoll } from "$lib/server/store.js";

let io: Server | undefined = undefined;

export function startSocketIO() {
	if (io !== undefined) return;

	io = new Server(3001, {
		serveClient: false,
		cors: {
			origin: env.PUBLIC_APP_URL,
		},
	});

	io.on("connection", (socket) => {
		if (!socket.handshake.query.roomCode) {
			socket.disconnect(true);
			return;
		}

		const roomCode = Array.isArray(socket.handshake.query.roomCode)
			? socket.handshake.query.roomCode[0]
			: socket.handshake.query.roomCode;
		const isControl = socket.handshake.query.isControl === "y";

		socket.join(roomCode);
		console.log(`${socket.id} (${isControl ? "control" : "display"}) connected to room ${roomCode}`);

		if (isControl) {
			socket.emit("initial-state", getPollVotes(roomCode));

			socket.on("poll-start", async (channels, callback) => {
				console.log(socket.id + " wants to start a poll on " + roomCode + ", channels " + channels.toString());

				if (Array.isArray(channels) && channels.length > 0 && channels.length <= 10) {
					try {
						await startPoll(roomCode, new Set<string>(channels));
						socket.to(roomCode).emit("poll-started");
						callback({ error: false });
					} catch (e) {
						callback({ error: true });
					}
				} else {
					callback({ error: true });
				}
			});

			socket.on("poll-end", async (callback) => {
				console.log(socket.id + " wants to end a poll on " + roomCode);

				try {
					const finalResult = getPollVotes(roomCode);
					await endPoll(roomCode);
					socket.to(roomCode).emit("poll-ended", finalResult);
					callback({ error: false, finalResult });
				} catch (e) {
					callback({ error: true });
				}
			});
		}
	});

	console.log("Socket.IO started");
}

export function broadcast(roomCode: string, event: string, ...args: any) {
	if (io === undefined) return;
	io.to(roomCode).emit(event, ...args);
}
