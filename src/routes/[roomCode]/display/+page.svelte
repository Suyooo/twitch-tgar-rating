<script lang="ts">
	import { page } from "$app/stores";
	import { pollHandler } from "$lib/pollhandler.js";
	import { createSocket } from "$lib/socketio/client.js";
	import { slide } from "svelte/transition";

	const socket = createSocket($page.params.roomCode, false);
	const { pollActive, pollVotes, pollTotalVotes, pollAverage, pollPercentages } = pollHandler(socket);
	let pollHighestPercentage: number;
	$: pollHighestPercentage = $pollPercentages.reduce((m, c) => Math.max(m, c));

	let barHeight: number, graphHeight: number;
	$: barHeight = parseFloat($page.url.searchParams.get("barHeight") ?? "12.5");
	$: graphHeight = parseFloat($page.url.searchParams.get("graphHeight") ?? "30");

	let showStatus: 0 | 1 | 2 = 0;
	socket.on("overlay-moved", (num) => {
		showStatus = num;
	});

	let rotate: boolean = false;
	setInterval(() => (rotate = !rotate), 5000);
</script>

<div
	class="overlay"
	style:top="{showStatus === 0 ? 100 : 100 - (showStatus === 1 ? barHeight : barHeight + graphHeight)}%"
>
	<div class="barcont" style:height="{barHeight}vh">
		<div class="bar">
			<div class="bar-title" style:font-size="{barHeight - 4}vh">
				{#if $pollActive}
					<div transition:slide={{}}>Rate This Game!</div>
				{:else}
					<div transition:slide={{}}>Final Score</div>
				{/if}
			</div>
			<div class="bar-rotator">
				{#if $pollActive && rotate}
					<div transition:slide={{}}>Type <b>[Your Score] / 10</b> in Chat</div>
				{:else}
					<div transition:slide={{}}>{$pollTotalVotes} vote{$pollTotalVotes === 1 ? "" : "s"}</div>
				{/if}
			</div>
			<div class="bar-score" style:font-size="{barHeight - 2}vh">
				<div style="height:0;overflow:hidden;">0.0★</div>
				{#if $pollTotalVotes > 0}
					<div in:slide={{}}>{$pollAverage.toFixed(1)}★</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="graphcont" style:height="{graphHeight}vh">
		<div class="graph">
			{#each $pollPercentages as pct, rating}
				{@const barHeight = $pollTotalVotes === 0 ? 0 : pct / pollHighestPercentage}
				<div class="graph-column">
					<div class="graph-bar" style:height="{barHeight * 80}%"></div>
					<div class="graph-label">{rating}</div>
				</div>
			{/each}
		</div>
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

	.overlay {
		position: absolute;
		left: 0;
		right: 0;
		background: linear-gradient(black, rgba(0, 0, 0, 0.95) 15px, black 100%);
		color: white;
		transition: top ease-out 0.5s;
	}

	.barcont {
		position: relative;
		width: 100%;
	}
	.bar {
		position: absolute;
		left: 2em;
		right: 2em;
		top: 1em;
		bottom: 1em;

		display: flex;
		align-items: center;
	}
	.bar-title {
		font-weight: 900;
		text-transform: uppercase;
		color: #facc15;
	}
	.bar-rotator {
		padding: 0 0.5em;
		flex-grow: 1;
		font-size: 4vh;
		text-align: right;
	}
	.bar-rotator b {
		color: #fef08a;
		text-transform: uppercase;
	}
	.bar-score {
		font-weight: 900;
		text-transform: uppercase;
		text-align: right;
		white-space: nowrap;
		color: #facc15;
	}

	.graphcont {
		position: relative;
		width: 100%;
	}
	.graph {
		position: absolute;
		left: 2em;
		right: 2em;
		top: 0;
		bottom: 1em;
		display: flex;
		align-items: stretch;
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
		background-color: #facc15;
		border-bottom: 1px solid #facc15;
		transition: height ease-out 0.3s;
	}
	.graph-label {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		text-align: center;
		font-size: 3vh;
		font-weight: 700;
	}
</style>
