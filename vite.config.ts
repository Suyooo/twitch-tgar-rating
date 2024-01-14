import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import backend from "./src/lib/server/plugin.js";

export default defineConfig({
	plugins: [sveltekit(), backend()],
	optimizeDeps: {
		include: ["socket.io-client"], // avoid server restart on first control/display page visit
	},
	build: {
		rollupOptions: {
			external: ["socket.io"], // avoid warnings during build, will still be bundled in adapter
		},
	},
});
