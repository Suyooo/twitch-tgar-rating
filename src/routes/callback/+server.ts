import type { RequestHandler } from "./$types";
import { text } from "@sveltejs/kit";
import { handleAuthCallback } from "$lib/server/auth.js";

export const GET: RequestHandler = async ({ request }) => {
	await handleAuthCallback(request);
	return text("Authorization finished. Check console output.");
};
