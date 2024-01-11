import { env } from "$env/dynamic/private";

const IS_DEBUG = env.DEBUG === "1";

function logString(t: string, s: string) {
	return `${new Date().toLocaleTimeString()} [${t.padEnd(4)}] ${s}`;
}

export default {
	IS_DEBUG,
	debug: (t: string, s: string) => {
		if (IS_DEBUG) console.log(logString(t, s));
	},
	log: (t: string, s: string) => {
		console.log(logString(t, s));
	},
	error: (t: string, s: string) => {
		console.error(logString(t, s));
	},
};
