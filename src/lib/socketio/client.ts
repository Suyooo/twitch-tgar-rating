import Client from "socket.io-client";

export type CallbackResponse<T> = (T & { error: false }) | { error: true };

export function createSocket(roomCode: string, isControl: boolean) {
	console.log("Connecting...");
	const socket = Client(":3001", { query: { roomCode, isControl: isControl ? "y" : "n" } });
	return socket;
}
