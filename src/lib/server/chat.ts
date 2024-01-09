import tmi from "tmi.js";
import { recordVote } from "$lib/server/store.js";

const RATING_REGEX = /.*?(-?\d+).+?10/;
const TEST = true;

let client: tmi.Client | undefined = undefined;
const channelRefCount: { [channelName: string]: number } = {};

export async function startBot() {
	const opts = {
		channels: ["suyooo"],
	};

	client = new tmi.client(opts);

	client.on("message", (channel, userstate, message, self) => {
		if (self || userstate["user-id"] === undefined) {
			return;
		}

		if (!TEST) {
			const match = message.trim().match(RATING_REGEX);
			if (match) {
				let rating = parseInt(match[1]);
				if (rating > 10) rating = 10;
				if (rating < 0) rating = 0;
				recordVote(channel.substring(1), parseInt(userstate["user-id"]), rating);
			}
		} else {
			recordVote(channel.substring(1), parseInt(userstate["user-id"]), Math.floor(Math.random() * 11));
		}
	});

	client.on("connected", () => {
		console.log(`Bot connected to Twitch chat servers`);
	});

	client.connect().catch(async () => {
		setTimeout(() => startBot(), 5000);
	});
}

export async function joinChannel(channel: string) {
	if (!client) return;

	if (channel in channelRefCount) {
		channelRefCount[channel]++;
	} else {
		channelRefCount[channel] = 1;
		await client.join(channel);
	}
}

export async function leaveChannel(channel: string) {
	if (!client) return;

	if (channelRefCount[channel] > 1) {
		channelRefCount[channel]--;
	} else {
		delete channelRefCount[channel];
		await client.part(channel);
	}
}
