import type { PollVotes } from "$lib/server/store.js";

export type CallbackResponse<T> = (T & { error: false }) | { error: true };

export interface ClientToServerEvents {
	"poll-start": (channels: string[], callback: (reply: CallbackResponse<{}>) => void) => void;
	"poll-end": (callback: (reply: CallbackResponse<{ finalResult: PollVotes }>) => void) => void;
	"overlay-move": (position: 0 | 1 | 2, callback: (reply: CallbackResponse<{}>) => void) => void;
}
export interface ServerToClientEvents {
	"initial-state": (initialVotes?: PollVotes) => void;
	"poll-started": () => void;
	"poll-ended": (finalResult: PollVotes) => void;
	"poll-voted": (rating: number, prevRating?: number) => void;
	"overlay-moved": (position: 0 | 1 | 2) => void;
}
