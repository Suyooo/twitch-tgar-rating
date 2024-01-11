import tmi from "tmi.js";
import logger from "$lib/logger.js";
import { recordVote } from "$lib/server/store.js";

const RATING_REGEX = /.*?(-?\d+).+?10/;
const TEST = false;

let client: tmi.Client | undefined = undefined;
const channelRefCount: { [channelName: string]: number } = {};

export async function startBot() {
	const opts = {
		options: {
			debug: logger.IS_DEBUG,
			skipMembership: true,
			skipUpdatingEmotesets: true,
			updateEmotesetsTimer: 0,
		},
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
				logger.debug("CHAT", `^ Rating found: ${rating}`);
				recordVote(channel.substring(1), parseInt(userstate["user-id"]), rating);
			}
		} else {
			recordVote(channel.substring(1), parseInt(userstate["user-id"]), message.length % 11);
		}
	});

	client.on("connected", () => {
		logger.log("CHAT", `Bot connected to Twitch chat servers`);
	});

	client.connect();
}

export async function joinChannel(channel: string) {
	if (!client) return;

	if (channel in channelRefCount) {
		channelRefCount[channel]++;
		logger.debug("CHAT", `${channel} already watched, new ref count = ${channelRefCount[channel]}`);
	} else {
		channelRefCount[channel] = 1;
		try {
			await client.join(channel);
			logger.debug("CHAT", `${channel} joined, starting timeout`);
			await new Promise((r) => setTimeout(r, 500));
		} catch (e) {
			delete channelRefCount[channel];
			logger.error("CHAT", `Failed to join ${channel}, resetting ref count`);
			throw e;
		}
	}
}

export async function leaveChannel(channel: string) {
	if (!client) return;

	if (channelRefCount[channel] > 1) {
		channelRefCount[channel]--;
		logger.debug("CHAT", `${channel} still watched, new ref count = ${channelRefCount[channel]}`);
	} else {
		delete channelRefCount[channel];
		try {
			await client.part(channel);
			logger.debug("CHAT", `${channel} parted, starting timeout`);
			await new Promise((r) => setTimeout(r, 500));
		} catch (e) {
			logger.error("CHAT", `Failed to part ${channel}`);
			throw e;
		}
	}
}
