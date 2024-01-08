import { joinChannel, leaveChannel } from "$lib/server/chat.js";

type PollResult = {
	startedAt: number;
	channels: Set<string>;
	voteCounts: [number, number, number, number, number, number, number, number, number, number, number];
	userMap: { [userId: number]: number };
};

const polls: { [roomCode: string]: PollResult } = {};

export function startPoll(roomCode: string, channels: Set<string>) {
	polls[roomCode] = {
		startedAt: Date.now(),
		channels,
		voteCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		userMap: {},
	};

	for (const channel of channels) {
		joinChannel(channel);
	}
}

export function endPoll(roomCode: string) {
	for (const channel of polls[roomCode].channels) {
		leaveChannel(channel);
	}

	delete polls[roomCode];
}

const POLL_MAX_TIME = 15 * 60 * 1000 * 1000;

export function setupRoomCleanup() {
	setInterval(() => {
		for (const roomCode of Object.keys(polls)) {
			if (Date.now() > polls[roomCode].startedAt + POLL_MAX_TIME) {
				endPoll(roomCode);
			}
		}
	}, 60 * 1000);
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
