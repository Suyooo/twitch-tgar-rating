<script lang="ts">
	import { browser } from "$app/environment";
	import Collapse from "$lib/icons/Collapse.svelte";
	import Expand from "$lib/icons/Expand.svelte";
	import { pollHandler } from "$lib/pollhandler.js";
	import type { PollVotes } from "$lib/server/chat/store.js";
	import { createSocket } from "$lib/socketio/client.js";
	import type { CallbackResponse } from "$lib/socketio/events.js";
	import { slide } from "svelte/transition";

	let { params } = $props();

	let connected: boolean = $state(false);
	const socket = browser ? createSocket(params.roomCode, true) : undefined;
	const { pollActive, pollVotes, pollTotalVotes, pollAverage, pollPercentages } = pollHandler(socket);
	if (browser) socket!.on("initial-state", () => (connected = true));

	let showChannels: boolean = $state(true),
		channels: string[] = $state(browser ? JSON.parse(localStorage.getItem("tgar-channels") ?? "[]") : []),
		channelToAdd: string = $state(""),
		channelsToRemove: string[] = $state([]);

	function addChannel() {
		const channelName = channelToAdd
			?.trim()
			.toLowerCase()
			.replaceAll(/[^a-zA-Z0-9_]/g, "");
		if (channelName === undefined || channelName.length === 0 || channels.some((c) => c === channelName)) return;
		channels.push(channelName);
		channels = channels;
		channelToAdd = "";
		localStorage.setItem("tgar-channels", JSON.stringify(channels));
	}

	function removeChannels() {
		channels = channels.filter((c) => !channelsToRemove.some((cc) => c === cc));
		channelsToRemove = [];
		localStorage.setItem("tgar-channels", JSON.stringify(channels));
	}

	let pollBusy: boolean = $state(false);

	function startPoll() {
		if (channels === undefined || channels.length === 0) {
			alert("You need to add at least one channel before starting a poll!");
			return;
		} else if (channels !== undefined && channels.length > 10) {
			alert("You can only watch up to 10 channels, please remove some!");
			return;
		}

		pollBusy = true;
		socket!
			.timeout(3000 + 500 * channels.length)
			.emit("poll-start", channels, (err: Error, response: CallbackResponse<{}>) => {
				pollBusy = false;
				if (err) {
					alert("Request timed out, please check your internet connection or try refreshing!");
				} else if (response.error !== null) {
					if (response.error === "Rate Limit") {
						alert("The bot is currently rate limited. Try again in 20 seconds!");
					} else {
						alert("There was an error starting the poll - make sure the channels are spelled correctly!");
					}
				} else {
					pollActive.set(true);
					pollVotes.set([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
				}
			});
	}

	function endPoll() {
		pollBusy = true;
		socket!
			.timeout(3000 + 500 * channels.length)
			.emit("poll-end", (err: Error, response: CallbackResponse<{ finalResult: PollVotes }>) => {
				pollBusy = false;
				if (err) {
					alert("Request timed out, please check your internet connection or try refreshing!");
				} else if (response.error !== null) {
					alert(
						"There was an error stopping the poll - please try refreshing the control panel and stream display!"
					);
				} else {
					pollActive.set(false);
					pollVotes.set(response.finalResult);
				}
			});
	}

	let positionBusy: boolean = $state(false);

	function setPosition(num: 0 | 1 | 2) {
		return () => {
			positionBusy = true;
			socket!.timeout(5000).emit("overlay-move", num, (err: Error, response: CallbackResponse<{}>) => {
				positionBusy = false;
				if (err) {
					alert("Request timed out, please check your internet connection or try refreshing!");
				} else if (response.error !== null) {
					alert(
						"There was an error moving the overlay - please try refreshing the control panel and stream display!"
					);
				}
			});
		};
	}
</script>

<div class="container">
	{#if browser && connected}
		<h2>Poll Controls</h2>
		<div class="buttons">
			<button disabled={$pollActive || pollBusy} onclick={startPoll}>Start Poll</button>
			<button disabled={!$pollActive || pollBusy} onclick={endPoll}>End Poll</button>
		</div>

		<h2>Overlay Position</h2>
		<div class="buttons">
			<button disabled={positionBusy} onclick={setPosition(0)}>Hidden</button>
			<button disabled={positionBusy} onclick={setPosition(1)}>Show Bar</button>
			<button disabled={positionBusy} onclick={setPosition(2)}>Show Bar + Graph</button>
		</div>

		<div style="margin-top: 1em;display:flex;align-items:center;">
			<h2 style="margin:0;flex-grow:1">Watched Channels</h2>
			{#if !showChannels}
				<div style="margin-right: .5em">
					({channels?.length ?? 0} channel{channels?.length === 1 ? "" : "s"})
				</div>
			{/if}
			<button onclick={() => (showChannels = !showChannels)}>
				{#if showChannels}
					Hide <Collapse />
				{:else}
					Show <Expand />
				{/if}
			</button>
		</div>
		{#if showChannels}
			<div transition:slide={{}} class="channels-input">
				<input
					style="width: 100%"
					disabled={$pollActive || pollBusy}
					bind:value={channelToAdd}
					placeholder="Enter Channel Name"
				/>
				<button
					disabled={$pollActive ||
						pollBusy ||
						channelToAdd === undefined ||
						channelToAdd.length === 0 ||
						channels.length >= 10}
					onclick={addChannel}
				>
					Add
				</button>
				<select style="width: 100%" multiple bind:value={channelsToRemove}>
					{#if channels && channels.length > 0}
						{#each channels as c}
							<option>{c}</option>
						{/each}
					{:else}
						<option disabled>No channels watched yet</option>
					{/if}
				</select>
				<button
					style="align-self:self-start"
					disabled={$pollActive ||
						pollBusy ||
						channelsToRemove === undefined ||
						channelsToRemove.length === 0 ||
						channels.length === 0}
					onclick={removeChannels}
				>
					Remove selected
				</button>
			</div>
		{/if}

		<h2 style="margin-top: 1em;">{$pollActive ? "Current " : $pollTotalVotes === 0 ? "" : "Final "} Results</h2>
		{#if $pollTotalVotes > 0}
			<table>
				<tbody>
					<tr class="resultsline">
						<td colspan="3">
							Score: <b>{$pollAverage.toFixed(1)} / 10</b> from
							<b>{$pollTotalVotes} vote{$pollTotalVotes === 1 ? "" : "s"}</b>
						</td>
					</tr>
					<tr>
						<th>Rating</th>
						<th>Votes</th>
						<th>Share</th>
					</tr>
					{#each $pollVotes as amount, rating}
						<tr>
							<td>{rating} / 10</td><td>{amount}</td><td
								>{($pollPercentages[rating] * 100).toFixed(0)}%</td
							>
						</tr>
					{/each}
					<tr class="resultsline">
						<td colspan="3">
							Average to four places:
							<b>{$pollAverage.toFixed(4)}</b>
						</td>
					</tr>
				</tbody>
			</table>
		{:else if $pollActive}
			No votes yet
		{:else}
			No poll active
		{/if}
	{:else}
		<div style="width:100%;display:flex;flex-direction:column;align-items:center;">
			<div style="margin-top: 4em;margin-bottom:4em;">Connecting to room...</div>
			<div class="spinner"></div>
		</div>
	{/if}
</div>

<style>
	h2 {
		margin: 0.5em 0;
	}

	.buttons {
		width: 100%;
		display: flex;
		gap: 1em;
	}
	.buttons > button {
		flex: 1 0 0;
	}

	.channels-input {
		display: grid;
		grid-template-columns: 60% 40%;
		align-items: start;
		justify-items: start;
		gap: 0.5em 1em;
		align-items: center;
	}

	.resultsline {
		background-color: #facc15;
	}

	.resultsline td {
		padding: 0.5em 1em;
		text-align: left;
		font-weight: normal;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.spinner {
		width: 2em;
		height: 2em;
		border: 4px solid black;
		border-bottom: 4px solid transparent;
		border-radius: 100%;
		animation: spin infinite 1s linear;
	}
</style>
