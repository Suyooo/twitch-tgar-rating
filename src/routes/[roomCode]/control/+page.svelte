<script lang="ts">
	import { page } from "$app/stores";

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
		fetch(`/${$page.params.roomCode}/control`, {
			method: "POST",
			body: JSON.stringify({
				action: "start",
				channels: channelsArray,
			}),
			headers: {
				"content-type": "application/json",
			},
		})
			.then((res) => {
				if (res.ok) pollActive = true;
				else alert("There was an error starting the poll - make sure the channels are spelled correctly!");
			})
			.finally(() => (pollBusy = false));
	}

	function endPoll() {
		pollBusy = true;
		fetch(`/${$page.params.roomCode}/control`, {
			method: "POST",
			body: JSON.stringify({
				action: "end",
			}),
			headers: {
				"content-type": "application/json",
			},
		})
			.then((res) => {
				if (res.ok) pollActive = false;
				else
					alert(
						"There was an error stopping the poll - please try refreshing the control panel and stream display!"
					);
			})
			.finally(() => (pollBusy = false));
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
