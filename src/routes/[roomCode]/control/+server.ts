import type { RequestHandler } from "./$types";
import { error, text } from "@sveltejs/kit";
import { endPoll, startPoll } from "$lib/server/store.js";

export const POST: RequestHandler = async ({ params, request }) => {
	const data = await request.json();
	try {
		if (data.action === "start") {
			if (Array.isArray(data.channels) && data.channels.length > 0) {
				await startPoll(params.roomCode, data.channels);
			} else {
				return error(400);
			}
		} else if (data.action === "end") {
			await endPoll(params.roomCode);
		} else if (data.action === "hide") {
			// hide overlay
		} else if (data.action === "bar") {
			// show only bar
		} else if (data.action === "graph") {
			// show full overlay
		} else {
			return error(400);
		}
		return text("");
	} catch (e) {
		console.error(`Failed to handle control request, room ${params.roomCode}`);
		console.error("Payload:");
		console.error(data);
		console.error("Error:");
		console.error(e);
		return error(503);
	}
};
