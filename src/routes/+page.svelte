<script lang="ts">
	import { goto } from "$app/navigation";
	import Footer from "$lib/Footer.svelte";

	let roomCode: string = $state("");
</script>

<div class="container">
	<h1>TGAR Twitch Ratings</h1>
	<div>
		Enter a room code for your session! This will be used to generate the URLs for your overlay.<br />
		You can choose any code you like, but if you are using a public server, treat this room code like a password - anyone
		who can guess the room code will be able use your control panel.
	</div>
	<input bind:value={roomCode} placeholder="Room Code" style="margin-top:1em" />
	<button onclick={() => goto("/" + roomCode)}>Go</button>

	<Footer />
</div>
