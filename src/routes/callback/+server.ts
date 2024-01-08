import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { auth } from "$lib/backend/auth.js";

export const GET: RequestHandler = async ({ request }) => {
	const user = await auth.code.getToken(request.url);
	console.log(user.data); //=> { accessToken: '...', tokenType: 'bearer', ... }

	// Refresh the current users access token.
	user.refresh().then(function (updatedUser) {
		console.log(updatedUser !== user); //=> true
		console.log(updatedUser.accessToken);
	});

	console.log(user.data);

	return json(user.data);
};
