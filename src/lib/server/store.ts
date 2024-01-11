import logger from "$lib/logger.js";
import { unwatchChannels, watchChannels } from "$lib/server/chat.js";
import { broadcast } from "$lib/socketio/server.js";

export type PollVotes = [number, number, number, number, number, number, number, number, number, number, number];
type PollResult = {
	startedAt: number;
	channels: Set<string>;
	voteCounts: PollVotes;
	userMap: { [userId: number]: number };
};

const polls: { [roomCode: string]: PollResult } = {};

export async function startPoll(roomCode: string, channels: Set<string>) {
	await watchChannels(...channels);

	polls[roomCode] = {
		startedAt: Date.now(),
		channels,
		voteCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		userMap: {},
	};
}

export async function endPoll(roomCode: string, broadcastEnd: boolean = false) {
	if (polls[roomCode] === undefined) return;

	// Asynchronously unwatch channels, so results can be returned immediately
	unwatchChannels(...polls[roomCode].channels).catch(() => null);
	if (broadcastEnd) {
		broadcast(roomCode, "poll-ended", getPollVotes(roomCode)!);
	}
	delete polls[roomCode];
}

const POLL_MAX_TIME = 15 * 60 * 1000 * 1000; // 15 minutes

export function setupRoomCleanup() {
	setInterval(() => {
		for (const roomCode of Object.keys(polls)) {
			if (Date.now() > polls[roomCode].startedAt + POLL_MAX_TIME) {
				logger.debug("STR", `Poll for room ${roomCode} timed out`);
				endPoll(roomCode, true);
			}
		}
	}, 60 * 1000); // 1 minute
}

export function recordVote(channel: string, userId: number, rating: number) {
	for (const roomCode of Object.keys(polls)) {
		const p = polls[roomCode];
		if (p.channels.has(channel)) {
			const prevRating: number | undefined = p.userMap[userId];
			logger.debug("STR", `Recording vote for poll in room ${roomCode}, previous rating = ${prevRating}`);
			if (prevRating !== undefined) {
				if (prevRating === rating) {
					// repeated vote
					continue;
				}
				// remove previous vote
				p.voteCounts[p.userMap[userId]]--;
			}
			p.voteCounts[rating]++;
			p.userMap[userId] = rating;
			broadcast(roomCode, "poll-voted", rating, prevRating);
		}
	}
}

export function getPollVotes(roomCode: string): PollResult["voteCounts"] | undefined {
	return polls[roomCode]?.voteCounts;
}
