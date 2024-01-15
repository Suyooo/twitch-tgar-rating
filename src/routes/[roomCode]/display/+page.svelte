<script lang="ts">
	import { page } from "$app/stores";
	import Star from "$lib/icons/Star.svelte";
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
	id="overlay"
	class="overlay"
	style:top="{showStatus === 0 ? 100 : 100 - (showStatus === 1 ? barHeight : barHeight + graphHeight)}%"
>
	<div class="barcont" style:height="{barHeight}vh">
		<div class="bar">
			<div class="bar-title">
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
			<div class="bar-score">
				<div style="height:0;overflow:hidden;">0.0<Star /></div>
				{#if $pollTotalVotes > 0}
					<div in:slide={{}}>{$pollAverage >= 10 ? 10 : $pollAverage.toFixed(1)}<Star /></div>
				{/if}
			</div>
		</div>
	</div>
	<div class="graphcont" style:height="{graphHeight}vh">
		<div class="graph">
			<div class="graph-label-row">
				{#each $pollPercentages as _, rating}
					<div class="graph-column">
						<div class="graph-label">{rating}</div>
					</div>
				{/each}
			</div>
			<div class="graph-bar-row">
				{#each $pollPercentages as pct}
					{@const barHeight =
						$pollTotalVotes === 0 || pct === 0 ? "1px" : `${(pct / pollHighestPercentage) * 100}%`}
					<div class="graph-column">
						<div class="graph-bar" style:height={barHeight}></div>
					</div>
				{/each}
			</div>
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
		overflow: hidden;
	}

	.overlay {
		position: absolute;
		left: 0;
		right: 0;
		background: linear-gradient(black, rgba(0, 0, 0, 0.95) 15px, black 100%);
		color: white;
		transition: top ease-out 0.5s;
		--color-primary: #facc15;
		--color-secondary: #fef08a;
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
		position: absolute;
		width: 100%;
		left: 0;
		font-size: 8vh;
		font-weight: 900;
		text-transform: uppercase;
		color: var(--color-primary);
	}
	.bar-rotator {
		padding: 0 0.25em;
		flex-grow: 1;
		font-size: 4vh;
		text-align: right;
	}
	.bar-rotator b {
		color: var(--color-secondary);
		text-transform: uppercase;
	}
	.bar-score {
		font-size: 10vh;
		font-weight: 900;
		text-transform: uppercase;
		text-align: right;
		white-space: nowrap;
		color: var(--color-primary);
	}
	.bar-score :global(svg) {
		margin-bottom: -0.15em;
		width: 1em;
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
	}
	.graph-column {
		position: relative;
		flex: 1 0 0;
	}
	.graph-label-row {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 3vh;
		display: flex;
		align-items: stretch;
	}
	.graph-label {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		text-align: center;
		line-height: 3vh;
		font-size: 3vh;
		font-weight: 700;
	}
	.graph-bar-row {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 4vh;
		top: 0;
		display: flex;
		align-items: stretch;
		overflow: hidden;
	}
	.graph-bar {
		position: absolute;
		left: 1rem;
		right: 1rem;
		bottom: 0;
		background-color: var(--color-primary);
		transition: height ease-out 0.3s;
	}
</style>
