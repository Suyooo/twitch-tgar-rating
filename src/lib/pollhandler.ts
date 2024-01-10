import { type Readable, type Writable, derived, writable } from "svelte/store";
import type { Socket } from "socket.io-client";
import type { PollVotes } from "$lib/server/store.js";
import type { ClientToServerEvents, ServerToClientEvents } from "$lib/socketio/events.js";

type Handlers = {
	pollActive: Writable<boolean>;
	pollVotes: Writable<PollVotes>;
	pollTotalVotes: Readable<number>;
	pollAverage: Readable<number>;
	pollPercentages: Readable<PollVotes>;
};

export function pollHandler(socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined): Handlers {
	if (socket == undefined) return {} as Handlers; // pages must ensure the stores are not used during SSR

	const pollActive: Writable<boolean> = writable(false);
	const pollVotes: Writable<PollVotes> = writable([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

	socket.on("initial-state", (initialVotes?: PollVotes) => {
		if (initialVotes == undefined) {
			pollActive.set(false);
		} else {
			pollActive.set(true);
			pollVotes.set(initialVotes);
		}
	});

	socket.on("poll-started", () => {
		pollActive.set(true);
		pollVotes.set([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	});

	socket.on("poll-ended", (finalResult: PollVotes) => {
		pollActive.set(false);
		pollVotes.set(finalResult);
	});

	socket.on("poll-voted", (rating: number, prevRating?: number) => {
		if (!pollActive) return; // final results already arrived, don't modify
		pollVotes.update((votes) => {
			votes[rating]++;
			if (prevRating !== undefined) votes[prevRating]--;
			return votes;
		});
	});

	const pollTotalVotes: Readable<number> = derived(pollVotes, (votes) => votes.reduce((p, c) => p + c));
	const pollAverage: Readable<number> = derived([pollVotes, pollTotalVotes], ([votes, total]) =>
		total === 0 ? 0 : votes.reduce((p, c, i) => p + c * i, 0) / total
	);
	const pollPercentages: Readable<PollVotes> = derived(
		[pollVotes, pollTotalVotes],
		([votes, total]) => (total === 0 ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : votes.map((a) => a / total)) as PollVotes
	);

	return { pollActive, pollVotes, pollTotalVotes, pollAverage, pollPercentages };
}
