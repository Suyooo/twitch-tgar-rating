import type { Plugin } from "vite";

export default function backendPlugin(): Plugin {
	let lastStopBackend: () => Promise<void>;

	return {
		name: "backend-plugin",
		enforce: "post",
		config: (config, env) => {
			// In build mode, add the backend as an entrypoint, so the regular build process catches it
			// The adapter can then import and call the module
			if (env.command === "build") {
				/* @ts-ignore */
				config.build.rollupOptions.input["backend"] = "src/lib/server/index.ts";
			}
			return config;
		},
		configureServer: (server) => {
			// In dev mode, attach the backend to the dev server
			return async () => {
				if (!server.httpServer) {
					throw new Error("No httpServer to inject into");
				}
				const { default: startBackend, stopBackend } = await server.ssrLoadModule("$lib/server/index.ts");
				startBackend(server.httpServer);
				lastStopBackend = stopBackend;
			};
		},
		handleHotUpdate: async (ctx) => {
			console.log(ctx);

			// If a backend module is updated, restart all services (since they do not support HMR seperately)
			for (const module of ctx.modules) {
				for (const importer of module.importers) {
					if (importer.url === "$lib/server/index.ts") {
						await lastStopBackend();

						try {
							const { default: startBackend, stopBackend } =
								await ctx.server.ssrLoadModule("$lib/server/index.ts");
							startBackend(ctx.server.httpServer);
							lastStopBackend = stopBackend;

							return ctx.modules;
						} catch (e) {
							lastStopBackend = () => new Promise<void>((resolve) => resolve());
							throw e;
						}
					}
				}
			}
			return ctx.modules;
		},
	};
}
