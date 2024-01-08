<script lang="ts">
	let roomcode: string;
</script>

Enter a room code for your session!<br />
You can choose any code you like, but treat it like a password - anyone who can guess the room code can use your control
panel.<br />
<input bind:value={roomcode} /> <button>Go</button>
