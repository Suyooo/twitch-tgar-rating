<script lang="ts">
	import { page } from "$app/stores";
	import { pollHandler } from "$lib/pollhandler.js";
	import { createSocket } from "$lib/socketio/client.js";

	const socket = createSocket($page.params.roomCode, false);
	const { pollActive, pollVotes, pollTotalVotes, pollAverage, pollPercentages } = pollHandler(socket);
</script>

{#if pollActive}
	<h1>Rate This Game</h1>
{:else}
	<h1>Final Score</h1>
{/if}
<div>Type [YOUR SCORE]/10 in Chat</div>
<div>{$pollTotalVotes} vote{$pollTotalVotes === 1 ? "" : "s"}</div>
{#if $pollTotalVotes > 0}
	<h2>{$pollAverage.toFixed(1)}★</h2>
{/if}

<style lang="postcss">
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
</style>
