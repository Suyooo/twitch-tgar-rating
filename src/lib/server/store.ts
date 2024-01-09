import { joinChannel, leaveChannel } from "$lib/server/chat.js";

type PollResult = {
	startedAt: number;
	channels: Set<string>;
	voteCounts: [number, number, number, number, number, number, number, number, number, number, number];
	userMap: { [userId: number]: number };
};

const polls: { [roomCode: string]: PollResult } = {};

export async function startPoll(roomCode: string, channels: Set<string>) {
	let joinedChannels = new Set<string>();
	try {
		for (const channel of channels) {
			await joinChannel(channel);
			joinedChannels.add(channel);
		}
	} catch (e) {
		for (const channel of joinedChannels) {
			await leaveChannel(channel).catch(() => null);
		}
		throw e;
	}

	polls[roomCode] = {
		startedAt: Date.now(),
		channels,
		voteCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		userMap: {},
	};
}

export async function endPoll(roomCode: string) {
	try {
		for (const channel of polls[roomCode].channels) {
			await leaveChannel(channel).catch(() => null);
		}
	} finally {
		delete polls[roomCode];
	}
}

const POLL_MAX_TIME = 15 * 60 * 1000 * 1000; // 15 minutes

export function setupRoomCleanup() {
	setInterval(() => {
		for (const roomCode of Object.keys(polls)) {
			if (Date.now() > polls[roomCode].startedAt + POLL_MAX_TIME) {
				endPoll(roomCode);
			}
		}
	}, 60 * 1000); // 1 minute
}

export function recordVote(channel: string, userId: number, rating: number) {
	for (const roomCode of Object.keys(polls)) {
		const p = polls[roomCode];
		if (p.channels.has(channel)) {
			if (userId in p.userMap) {
				// remove previous vote
				p.voteCounts[p.userMap[userId]]--;
			}
			p.voteCounts[rating]++;
			p.userMap[userId] = rating;
		}
	}
}

export function getPollResults(roomCode: string): PollResult | undefined {
	return polls[roomCode];
}
