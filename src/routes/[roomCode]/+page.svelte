<script lang="ts">
	import { page } from "$app/stores";
	import { env } from "$env/dynamic/public";

	function selectAll(e: MouseEvent) {
		e.preventDefault();
		if (e.target) (e.target as HTMLInputElement).select();
	}
</script>

<h1>Room {$page.params.roomCode}</h1>

<h2>Control Panel</h2>
<input readonly value="{env.PUBLIC_APP_URL}/{$page.params.roomCode}/control" on:mousedown={selectAll} />
This is where you will start and stop polls, and can slide the stream display in and out. Open this page on whatever you
want to use for control - for example your phone, or just
<a href="{env.PUBLIC_APP_URL}/{$page.params.roomCode}/control" target="_blank">open it in a new tab</a>.

<h2>Stream Display</h2>
<input
	readonly
	value="{env.PUBLIC_APP_URL}/{$page.params.roomCode}/display?barHeight=10&graphHeight=30"
	on:mousedown={selectAll}
/>
Add this URL as a Browser Source in OBS with size 1920x1080, and position it however you'd like. The overlay will slide in
from the bottom (you can't change that right now, but I can make the overlay a sidebar instead if that would look nicer).
Make sure to use the Overlay Position buttons on the Control Panel to test the height. You can change the numbers at the
end of the URL to change how high the bar and graph segments of the URL are (in percent of the browser source height).
