import Client from "socket.io-client";

export function controlSocket(roomCode: string) {
	const socket = shared(roomCode, true);
	return socket;
}

export function displaySocket(roomCode: string) {
	const socket = shared(roomCode, false);
	return socket;
}

function shared(roomCode: string, isControl: boolean) {
	console.log("Connecting...");
	const socket = Client(":3001", { query: { roomCode, isControl: isControl ? "y" : "n" } });
	return socket;
}
