import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { getPollResults } from "$lib/server/store.js";

export const GET: RequestHandler = async ({ params }) => {
	const res = getPollResults(params.roomCode);
	if (res === undefined) {
		return error(404);
	} else {
		return json(res);
	}
};
