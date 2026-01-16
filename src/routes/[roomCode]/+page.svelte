<script lang="ts">
	import { env } from "$env/dynamic/public";
	import Footer from "$lib/Footer.svelte";

	let { params } = $props();

	function selectAll(e: MouseEvent) {
		e.preventDefault();
		if (e.target) (e.target as HTMLInputElement).select();
	}
</script>

<div class="container">
	<h1>Room {params.roomCode}</h1>

	<h2>Control Panel</h2>
	<input style="width: 100%" readonly value="{env.PUBLIC_APP_URL}/{params.roomCode}/control" />
	<div style="margin-top: 0.5em">
		This is where you can start and stop polls, and can slide the stream overlay in and out.<br /><br />
		Open this page on whatever device you want to use for controlling the overlay. You can copy the link to a second
		device like a phone, or just open it on this PC:
	</div>
	<div>
		<button onclick={() => window.open(`${env.PUBLIC_APP_URL}/${params.roomCode}/control`, "_blank")}>
			Open in New Tab
		</button>
		<button onclick={() => window.open(`${env.PUBLIC_APP_URL}/${params.roomCode}/control`, "_blank", "popup")}>
			Open in New Window
		</button>
	</div>

	<h2>Stream Display</h2>
	<input
		style="width: 100%"
		readonly
		value="{env.PUBLIC_APP_URL}/{params.roomCode}/display?barHeight=12.5&graphHeight=30"
		onmousedown={selectAll}
	/>
	<div style="margin-top: 0.5em">
		Add this URL as a Browser Source in OBS. The only thing to watch out for is that the size must be set to
		1920x1080, the overlay does not need other specific settings or any permissions. You can then position it
		however you'd like, make sure to use the Overlay Position buttons on the Control Panel to test the height.<br
		/><br />
		The overlay will slide in from the bottom. You can change the numbers at the end of the URL to change how high the
		bar and graph parts of the overlay will be, defined in percent of the Browser Source height.
	</div>

	<Footer />
</div>
