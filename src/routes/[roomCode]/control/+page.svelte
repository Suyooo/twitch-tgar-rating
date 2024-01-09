<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { controlSocket } from "$lib/socketio/client.js";

	const socket = browser ? controlSocket($page.params.roomCode) : null;
	console.log(socket);

	let channels: string | undefined;

	let pollBusy: boolean = false;
	let pollActive: boolean = false;

	function startPoll() {
		const channelsArray = channels?.split(",").map((s) => s.trim().toLowerCase());
		if (channelsArray === undefined || channelsArray.length === 0) {
			alert("You need to add at least one channel before starting a poll!");
			return;
		}

		pollBusy = true;
		socket!.timeout(5000).emit("poll-start", channelsArray, (err: Error, response: { error: boolean }) => {
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

	function endPoll() {
		pollBusy = true;
		socket!.timeout(5000).emit("poll-end", (err: Error, response: { error: boolean }) => {
			pollBusy = false;
			if (err) {
				alert("Request timed out, please check your internet connection or try refreshing!");
			} else if (response.error) {
				alert(
					"There was an error stopping the poll - please try refreshing the control panel and stream display!"
				);
			} else {
				pollActive = false;
			}
		});
	}
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
