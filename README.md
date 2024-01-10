# TGAR Twitch Rating

A little Twitch bot to read chat's opinion. Originally made for the creative game idea pitching board game
["This Game Ain't Real"](https://thisgameaintreal.carrd.co/) (specifically the Game of The Year variant), but it can be
used for anything that needs chat to give a rating out of ten.

![Example GIF showing the stream overlay](example.gif?raw=true)

## How does it work?

The stream overlay is a web page embedded via OBS' Browser Source, and controlled via a seperate web page that can be
either opened on the side or on another device. When you start a poll, the bot will join your channel as an anonymous
guest user - no logins or permissions needed - to read the chat there, and records messages containing ratings.

## How can I run it?

To quickly run this on your own machine, download this repo and install the Node.JS runtime (tested on LTS version 20).
On your terminal, run `npm install` to download dependencies. Create a file called `.env`, and fill it with
`PUBLIC_APP_URL=http://localhost:5173`. Then, use `npm run dev` to run the project. Once it's started up, visit
`http://localhost:5173` in your browser to get started.

Note that this way, the app is only reachable from the same machine you are running it on. You can't open the control
panel on another device, or send the overlay to others. If you want to do that, you have to build the app (see below)
and run it on a seperate server.

## How can I build it?

-   If you use Docker, you can simply run `docker build` and get a Docker container ready to run. You just need to add
    the environment variables and port mappings to the `run` command or Compose file.
-   Otherwise, you can build the project by running `npm run build`. You can then copy the `build` folder and
    `package.json` to wherever you want to run it from, where you can start it using `node build`, assuming Node is
    installed on the machine. Remember to set the environment variables.

In both cases, the app will run on port 3000 by default, and the Socket.IO server is reachable on port 3001. You must
set the `PUBLIC_APP_URL` environment variable to the URL where the site is externally reachable (without a trailing
slash). Optionally, you can also define the environment variable `PUBLIC_SOCKETIO_URL`. It will default to
`[PUBLIC_APP_URL]:3001`, but if you have the [Socket.IO server behind a reverse proxy](https://socket.io/docs/v4/reverse-proxy/)
for example, you can override the URL here.

## Neat stuff I used for this

-   [SvelteKit](https://kit.svelte.dev/)
-   [Socket.IO](https://socket.io/)
-   [IconSVG](https://iconsvg.xyz/)
