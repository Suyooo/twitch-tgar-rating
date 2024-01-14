import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "./src/lib/server/adapter.js";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
	},
};

export default config;
