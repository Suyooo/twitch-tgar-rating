import { env } from "$env/dynamic/private";
import ClientOAuth2 from "client-oauth2";

const state = Math.random().toFixed(32).substring(2);

export const auth = new ClientOAuth2({
	clientId: env.TWITCH_APP_ID,
	clientSecret: env.TWITCH_APP_SECRET,
	accessTokenUri: "https://id.twitch.tv/oauth2/token",
	authorizationUri: "https://id.twitch.tv/oauth2/authorize",
	redirectUri: env.APP_URL + "/callback",
	scopes: ["chat:read"],
	state,
	query: {
		client_id: env.TWITCH_APP_ID,
		client_secret: env.TWITCH_APP_SECRET,
	},
});

let accessToken: string | undefined = undefined;

if (env.TWITCH_BOT_REFRESH_TOKEN !== undefined) {
	try {
		const token = auth.createToken("", env.TWITCH_BOT_REFRESH_TOKEN, {});
		accessToken = (await token.refresh()).accessToken;
	} catch (e) {
		console.log("Failed to refresh access token, ignoring stored token:");
		console.log(`    ${e}`);
	}
}

if (accessToken === undefined) {
	console.log("No token stored for authentication. Please log in as the bot account here:");
	console.log(`    ${auth.code.getUri()}`);
}

export async function getAccessToken() {
	while (accessToken === undefined) {
		await new Promise((r) => setTimeout(r, 1000));
	}
	return accessToken;
}

export async function handleAuthCallback(request: Request) {
	const user = await auth.code.getToken(request.url);
	accessToken = user.accessToken;
	console.log("Authentication finished. Add this token as TWITCH_BOT_REFRESH_TOKEN in your env variables");
	console.log(`    ${user.refreshToken}`);
}
