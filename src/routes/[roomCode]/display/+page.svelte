<script lang="ts">
	import { page } from "$app/stores";
	import { pollHandler } from "$lib/pollhandler.js";
	import { createSocket } from "$lib/socketio/client.js";

	const socket = createSocket($page.params.roomCode, false);
	const { pollActive, pollVotes, pollTotalVotes, pollAverage, pollPercentages } = pollHandler(socket);
	let pollHighestPercentage: number;
	$: pollHighestPercentage = $pollPercentages.reduce((m, c) => Math.max(m, c));

	let barHeight: string, graphHeight: string;
	$: barHeight = $page.url.searchParams.get("barHeight") ?? "10";
	$: graphHeight = $page.url.searchParams.get("graphHeight") ?? "30";
</script>

<div class="barcont" style:height="{barHeight}%">
	<div class="bar">
		{#if pollActive}
			<h1>Rate This Game</h1>
		{:else}
			<h1>Final Score</h1>
		{/if}
		<div>Type [YOUR SCORE]/10 in Chat</div>
		{#if $pollTotalVotes > 0}
			<h2>{$pollAverage.toFixed(1)}★</h2>
		{/if}
		<div>{$pollTotalVotes} vote{$pollTotalVotes === 1 ? "" : "s"}</div>
	</div>
</div>
<div class="graphcont" style:height="{graphHeight}%">
	<div class="graph">
		{#each $pollPercentages as pct, rating}
			{@const barHeight = pct / pollHighestPercentage}
			<div class="graph-column">
				<div class="graph-bar" style:height="{barHeight * 100}%"></div>
				<div class="graph-label">{rating}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	:global(html, body) {
		width: 1920px;
		height: 1080px;
		position: absolute;
		left: 0;
		top: 0;
		margin: 0;
		padding: 0;
		background: transparent;
	}

	:global(body) {
		top: 60%;
	}

	.barcont {
		position: relative;
		width: 100%;
		background-color: gray;
	}
	.bar {
		position: absolute;
		left: 2em;
		right: 2em;
		top: 1em;
		bottom: 1em;
		background-color: aquamarine;
	}

	.graphcont {
		position: relative;
		width: 100%;
		background-color: gray;
	}
	.graph {
		position: absolute;
		left: 2em;
		right: 2em;
		top: 0;
		bottom: 1em;
		display: flex;
		align-items: stretch;
		background-color: orange;
	}
	.graph-column {
		position: relative;
		flex: 1 0 0;
	}
	.graph-bar {
		position: absolute;
		left: 1rem;
		right: 1rem;
		bottom: 0;
		background-color: red;
	}
	.graph-label {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		text-align: center;
	}
</style>
