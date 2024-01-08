import { getAccessToken } from "$lib/server/auth.js";

getAccessToken().then((t) => console.log(t));
