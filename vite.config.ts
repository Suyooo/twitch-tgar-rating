import backend from "svelte-adapter-node-backend/plugin";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit(), backend()],
	optimizeDeps: {
		include: ["socket.io-client"], // avoid server restart on first control/display page visit
	},
	build: {
		rollupOptions: {
			external: ["socket.io", "open"], // avoid errors during build, will still be bundled in adapter
		},
	},
});
