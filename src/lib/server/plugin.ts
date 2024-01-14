import type { Plugin } from "vite";

export default function backendPlugin(): Plugin {
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
				const { default: startBackend } = await server.ssrLoadModule("$lib/server/index.ts");
				startBackend(server.httpServer);
			};
		},
		// TODO: how much has to be handled here?
		/*handleHotUpdate: async (ctx) => {
			const { stopSocketIOServer, setupSocketIOServer } =
				await ctx.server.ssrLoadModule("$lib/socketio/server.ts");
			stopSocketIOServer();
			setupSocketIOServer(ctx.server.httpServer);
		},*/
	};
}
