import { env } from "$env/dynamic/public";
import Client, { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "$lib/socketio/events.js";

export function createSocket(roomCode: string, isControl: boolean) {
	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = Client(env.PUBLIC_SOCKETIO_URL ?? ":3001", {
		query: { roomCode, isControl: isControl ? "y" : "n" },
	});
	return socket;
}
