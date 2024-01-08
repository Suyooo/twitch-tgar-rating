import { env } from "$env/dynamic/private";
import { env as envPub } from "$env/dynamic/public";
import ClientOAuth2 from "client-oauth2";

const state = Math.random().toFixed(32).substring(2);

export const auth = new ClientOAuth2({
	clientId: env.TWITCH_APP_ID,
	clientSecret: env.TWITCH_APP_SECRET,
	accessTokenUri: "https://id.twitch.tv/oauth2/token",
	authorizationUri: "https://id.twitch.tv/oauth2/authorize",
	redirectUri: envPub.PUBLIC_APP_URL + "/callback",
	scopes: ["chat:read"],
	state,
	query: {
		client_id: env.TWITCH_APP_ID,
		client_secret: env.TWITCH_APP_SECRET,
	},
});

let refreshToken: string | undefined = env.TWITCH_BOT_REFRESH_TOKEN;
let accessToken: string | undefined = undefined;

if (refreshToken !== undefined) {
	try {
		accessToken = await getAccessToken(true);
	} catch (e) {
		console.log("Failed to refresh access token, ignoring stored token:");
		console.log(`    ${e}`);
	}
}

if (accessToken === undefined) {
	console.log("No token stored for authentication. Please log in as the bot account here:");
	console.log(`    ${auth.code.getUri()}`);
}

export async function getAccessToken(refresh: boolean = false) {
	if (refresh) {
		if (refreshToken) {
			const token = auth.createToken("", refreshToken, {});
			accessToken = (await token.refresh()).accessToken;
		}
	} else {
		while (accessToken === undefined) {
			await new Promise((r) => setTimeout(r, 1000));
		}
	}
	return accessToken;
}

export async function handleAuthCallback(request: Request) {
	const user = await auth.code.getToken(request.url);
	accessToken = user.accessToken;
	refreshToken = user.refreshToken;
	console.log("Authentication finished. Add this token as TWITCH_BOT_REFRESH_TOKEN in your env variables");
	console.log(`    ${user.refreshToken}`);
}
