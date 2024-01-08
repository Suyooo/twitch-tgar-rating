import { env } from "$env/dynamic/private";
import tmi from "tmi.js";
import { getAccessToken } from "$lib/server/auth.js";

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
		console.log(channel, userstate["user-id"], message);
	});
	client.on("connected", (addr, port) => {
		console.log(`Connected to ${addr}:${port}`);
	});

	client.connect();
}
