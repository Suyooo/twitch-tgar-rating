import { env } from "$env/dynamic/private";
import tmi from "tmi.js";
import { getAccessToken } from "$lib/server/auth.js";

const RATING_REGEX = /.*?(-?\d+).*?10/;

export async function startBot() {
	const opts = {
		identity: {
			username: env.TWITCH_BOT_NAME,
			password: await getAccessToken(),
		},
		channels: ["suyooo"],
	};

	const client = new tmi.client(opts);

	client.on("message", (channel, userstate, message, self) => {
		if (self) {
			return;
		}

		const match = message.trim().match(RATING_REGEX);
		if (match) {
			let val = parseInt(match[1]);
			if (val > 10) val = 10;
			if (val < 0) val = 0;
			console.log(`${userstate.username} (${userstate["user-id"]}) rated this game ${val}/10`);
		}
	});

	client.on("connected", (addr, port) => {
		console.log(`Connected to ${addr}:${port}`);
	});

	client.connect();
}
