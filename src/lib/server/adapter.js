import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import nodeAdapter from "@sveltejs/adapter-node";
import { appendFileSync, readFileSync, unlinkSync } from "node:fs";
import { rollup } from "rollup";

/**
 * @param {import("@sveltejs/adapter-node").AdapterOptions} opts
 * @returns {import("@sveltejs/kit").Adapter}
 */
export default function (opts = {}) {
	const baseAdapter = nodeAdapter(opts);
	const { out = "build" } = opts;

	return {
		name: "adapter-node-with-backend",
		async adapt(builder) {
			// Re-export backend from server/index.js to avoid it being eliminated by tree-shaking
			appendFileSync(
				`${builder.config.kit.outDir}/output/server/index.js`,
				`
export { startBackend } from "./backend.js";
`
			);

			// Build SvelteKit, backend is included by the Vite plugin (plugin.ts)
			await baseAdapter.adapt(builder);

			// Remove unused backend bundle in client folder
			builder.log.minor("Remove backend from client");
			const manifest = JSON.parse(
				readFileSync(`${builder.config.kit.outDir}/output/client/.vite/manifest.json`, "utf8")
			);
			const backendClientFile = manifest["src/lib/server/index.ts"]["file"];
			unlinkSync(`${out}/client/${backendClientFile}`);

			// Append backend injection code to end of index.js
			builder.log.minor("Appending backend code");
			appendFileSync(
				`${out}/index.js`,
				`
import { startBackend } from "./server/index.js";
startBackend(server.server);
`
			);
		},
	};
}
