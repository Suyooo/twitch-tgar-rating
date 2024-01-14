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
			// Build SvelteKit, backend is included by the Vite plugin (plugin.ts)
			await baseAdapter.adapt(builder);

			// Remove unused backend bundle in client folder
			builder.log.minor("Remove backend from client");
			const manifest = JSON.parse(
				readFileSync(`${builder.config.kit.outDir}/output/client/.vite/manifest.json`, "utf8")
			);
			const backendClientFile = manifest["src/lib/server/index.ts"]["file"];
			unlinkSync(`${out}/client/${backendClientFile}`);

			// Re-bundle server with the backend (mostly copied from adapter-node)
			builder.log.minor("Re-bundling server with backend");
			builder.rimraf(`${out}/server`);
			const tmp = builder.getBuildDirectory("adapter-node");
			const pkg = JSON.parse(readFileSync("package.json", "utf8"));
			const bundle = await rollup({
				input: {
					index: `${tmp}/index.js`,
					backend: `${tmp}/backend.js`,
					manifest: `${tmp}/manifest.js`,
				},
				external: [
					// dependencies could have deep exports, so we need a regex
					...Object.keys(pkg.dependencies || {}).map((d) => new RegExp(`^${d}(\\/.*)?$`)),
				],
				plugins: [
					nodeResolve({
						preferBuiltins: true,
						exportConditions: ["node"],
					}),
					commonjs({ strictRequires: true }),
					json(),
				],
			});
			await bundle.write({
				dir: `${out}/server`,
				format: "esm",
				sourcemap: true,
				chunkFileNames: "chunks/[name]-[hash].js",
			});

			// Append Socket.IO injection code to end of index.js
			builder.log.minor("Appending backend code");
			appendFileSync(
				`${out}/index.js`,
				`
import startBackend from "./server/backend.js";
startBackend(server.server);
`
			);
		},
	};
}
