import tmi from "tmi.js";
import { recordVote } from "$lib/server/chat/store.js";
import logger from "$lib/server/logger.js";

const RATING_REGEX = /\D*?(-?\d+[.,]?\d*)\D+?10/;
const TEST = false; // Instead of reading ratings, just assign a pseudo-random score for every incoming message

let client: tmi.Client | undefined = undefined;
const channelRefCount: { [channelName: string]: number } = {};
let joinPartLimit = 20;

export async function startTwitchBot() {
	const opts = {
		options: {
			debug: logger.isDebug(),
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

	await client.connect();
	// Join/Part rate limit: 20 per 10s bucket, go with 15s to be safe
	setInterval(() => (joinPartLimit = 20), 15000);
}

export async function stopTwitchBot() {
	await client?.disconnect();
	client = undefined;
}

export async function watchChannels(...channels: string[]) {
	if (!client) return;
	if (joinPartLimit < channels.length) {
		throw new Error("Rate Limit");
	}
	joinPartLimit -= channels.length;

	for (let i = 0; i < channels.length; i++) {
		const channel = channels[i];
		logger.debug("CHAT", `Watching ${channel}`);
		if (channel in channelRefCount) {
			channelRefCount[channel]++;
			logger.debug("CHAT", `${channel} already watched, new ref count = ${channelRefCount[channel]}`);
			joinPartLimit++; // no join attempted
		} else {
			channelRefCount[channel] = 1;
			try {
				await client.join(channel);
				logger.debug("CHAT", `${channel} joined`);
			} catch (e) {
				delete channelRefCount[channel];
				logger.error("CHAT", `Failed to join ${channel}, resetting ref count`);

				// "Refund" unused limit
				joinPartLimit += channels.length - 1 - i;
				// Asynchronously part channels watched before the error, so we can return the error immediately
				const joinedChannels = channels.slice(0, i);
				logger.error("CHAT", `Parting already successfully joined channels: ${joinedChannels}`);
				unwatchChannels(...joinedChannels).catch(() => null);

				throw e;
			}
		}
	}
}

export async function unwatchChannels(...channels: string[]) {
	if (!client) return;
	while (joinPartLimit < channels.length) {
		logger.error("CHAT", `Waiting for rate limit to refresh before parting`);
		await new Promise((r) => setTimeout(r, 1000));
	}
	joinPartLimit -= channels.length;

	for (const channel of channels) {
		logger.debug("CHAT", `Unwatching ${channel}`);
		if (channelRefCount[channel] > 1) {
			channelRefCount[channel]--;
			logger.debug("CHAT", `${channel} still watched, new ref count = ${channelRefCount[channel]}`);
			joinPartLimit++; // no part attempted
		} else {
			delete channelRefCount[channel];
			try {
				await client.part(channel);
				logger.debug("CHAT", `${channel} parted`);
			} catch (e) {
				// Ignore error, assume bot has left the channel or server already - try to leave the other channels
				logger.error("CHAT", `Failed to part ${channel}`);
			}
		}
	}
}
