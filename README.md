# TGAR Twitch Rating

A little Twitch bot to read chat's opinion. Originally made for the creative game idea pitching board game
["This Game Ain't Real"](https://thisgameaintreal.carrd.co/) (specifically the Game of The Year variant), but it can be
used for anything that needs chat to give a rating out of ten.

![Example GIF showing the stream overlay](example.gif?raw=true)

## How does it work?

The stream overlay is a web page embedded via OBS' Browser Source, and controlled via a seperate web page that can be
either opened on the side or on another device. When you start a poll, the bot will join your channel as an anonymous
guest user - no logins or permissions needed - to read the chat there, and records all ratings sent in it.

## How do I run it?

There are no download-and-run executables yet, but hopefully soon!

For now, to run this on your own machine, download this repo (click the green "Code" button at the top, pick "Download
ZIP", extract it somewhere) and [install the Node.JS runtime](https://nodejs.org/) (I've tested this project on LTS
version 20). Open a terminal in the repo folder (where the `package.json` file is located), and run `npm install` to
download dependencies. Create a file called `.env.development`, and fill it with `PUBLIC_APP_URL=http://localhost:5173`.
Then, use `npm run dev` to run the project. Once it's started up, visit `http://localhost:5173` in your browser to see
the app.

If you run the stream on another machine than the one you run this server on, or want to have your control panel on
another device like your phone, you need to replace `localhost` in the control panel and stream overlay URLs you copy
from your browser, with the local IP or hostname of the computer that is hosting. How exactly you get those depends on
your operating system - try searching for how to find your local network IP. You might also need to allow the server to
pass through the firewall on your computer (not the one on your router!).

## How do I build it?

-   If you use Docker, you can simply run `docker build` and get a Docker container ready to run. You just need to add
    the environment variables and port mappings to the `run` command or Compose file.
-   Otherwise, you can build the project by running `npm run build`. You can then copy the `build` folder and
    `package.json` to wherever you want to run it from, where you can start it using `node build`, assuming Node is
    installed on the machine. Remember to set the environment variables.

In both cases, the app will run on port 3000 by default, which can be changed with the `PORT` environment variable. If
you are using a reverse proxy, [make sure to set it up correctly for Socket.IO in the `/socket.io` subpath](https://socket.io/docs/v4/reverse-proxy/).

## Styling

You can use the "Custom CSS" field in the settings for OBS' Browser Source to customize the overlay. Any CSS properties
work, use the selectors in the image below. Additionally, you can overwrite the `--color-primary` and
`--color-secondary` variables in the `#overlay` rule to change the colors for all elements at once instead of having to
override them on each of them seperately.

![Diagram matching the overlay elements to CSS selectors](styling_selectors.svg?raw=true)

### Example

```css
    #overlay {
        --color-primary: #ec4899;
        --color-secondary: #fbcfe8;
        font-family: "FreeMono";
    }
    #overlay .bar-title {
        letter-spacing: 10px;
    }
    #overlay .bar-rotator {
        font-size: 30px;
    }
```

![Example showing the CSS overrides above in action](styling_example.png?raw=true)

## Neat stuff I used for this

-   [SvelteKit](https://kit.svelte.dev/)
-   [Socket.IO](https://socket.io/)
-   [tmi.js](https://tmijs.com/)
-   [IconSVG](https://iconsvg.xyz/)
