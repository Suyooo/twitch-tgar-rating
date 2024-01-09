<script lang="ts">
	import { goto } from "$app/navigation";
	import Footer from "$lib/Footer.svelte";

	let roomCode: string;
</script>

<div class="container">
	<h1>TGAR Twitch Ratings</h1>
	<div>
		Enter a room code for your session! This will appear in the URLs you use for your stream. You can also share
		those URLs with other people you are streaming with, to have the vote show on their channels, too.<br />
		You can choose any code you like, but treat it like a password - anyone who can guess the room code can use your
		control panel.
	</div>
	<input bind:value={roomCode} placeholder="Room Code" style="margin-top:1em" />
	<button on:click={() => goto("/" + roomCode)}>Go</button>

	<Footer />
</div>
