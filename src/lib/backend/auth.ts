import { APP_URL, TWITCH_APP_ID, TWITCH_APP_SECRET } from "$env/static/private";
import ClientOAuth2 from "client-oauth2";

const state = Math.random().toFixed(32).substring(2);

export const auth = new ClientOAuth2({
	clientId: TWITCH_APP_ID,
	clientSecret: TWITCH_APP_SECRET,
	accessTokenUri: "https://id.twitch.tv/oauth2/token",
	authorizationUri: "https://id.twitch.tv/oauth2/authorize",
	redirectUri: APP_URL + "/callback",
	scopes: ["chat:read"],
	state,
	query: {
		client_id: TWITCH_APP_ID,
		client_secret: TWITCH_APP_SECRET,
	},
});
