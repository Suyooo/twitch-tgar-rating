import Client from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "$lib/socketio/events.js";

export function createSocket(roomCode: string, isControl: boolean) {
	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = Client({
		query: { roomCode, isControl: isControl ? "y" : "n" },
	});
	return socket;
}
