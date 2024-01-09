<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import type { PollVotes } from "$lib/server/store.js";
	import { createSocket, type CallbackResponse } from "$lib/socketio/client.js";

	const socket = browser ? createSocket($page.params.roomCode, true) : null;
	console.log(socket);

	let channels: string | undefined;

	let pollBusy: boolean = false;
	let pollActive: boolean = false;
	let pollVotes: PollVotes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	socket?.on("initial-state", (initialVotes: PollVotes | undefined) => {
		if (initialVotes === undefined) {
			pollActive = false;
		} else {
			pollActive = true;
			pollVotes = initialVotes;
		}
	});

	function startPoll() {
		const channelsArray = channels?.split(",").map((s) => s.trim().toLowerCase());
		if (channelsArray === undefined || channelsArray.length === 0) {
			alert("You need to add at least one channel before starting a poll!");
			return;
		} else if (channelsArray !== undefined && channelsArray.length > 10) {
			alert("You can only watch up to 10 channels, please remove some!");
			return;
		}

		pollBusy = true;
		socket!.timeout(5000).emit("poll-start", channelsArray, (err: Error, response: CallbackResponse<{}>) => {
			pollBusy = false;
			if (err) {
				alert("Request timed out, please check your internet connection or try refreshing!");
			} else if (response.error) {
				alert("There was an error starting the poll - make sure the channels are spelled correctly!");
			} else {
				pollActive = true;
			}
		});
	}

	socket?.on("poll-started", () => {
		pollActive = true;
	});

	function endPoll() {
		pollBusy = true;
		socket!.timeout(5000).emit("poll-end", (err: Error, response: CallbackResponse<{ finalResult: PollVotes }>) => {
			pollBusy = false;
			if (err) {
				alert("Request timed out, please check your internet connection or try refreshing!");
			} else if (response.error) {
				alert(
					"There was an error stopping the poll - please try refreshing the control panel and stream display!"
				);
			} else {
				console.log(response.finalResult);
				pollActive = false;
			}
		});
	}

	socket?.on("poll-ended", (finalResult: PollVotes) => {
		console.log(finalResult);
		pollActive = false;
	});
</script>

<h2>Poll Controls</h2>
<button disabled={pollActive || pollBusy} on:click={startPoll}>Start Poll</button>
<button disabled={!pollActive || pollBusy} on:click={endPoll}>End Poll</button>

<h2>Overlay Position</h2>
<button>Hidden</button><button>Show Bar</button><button>Show Bar + Graph</button>

<h2>Watched Channels</h2>
<input disabled={pollActive || pollBusy} bind:value={channels} />

<h2>Current/Last Poll Results</h2>
<div>Poll results go here</div>
