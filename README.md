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

Head over to [the Releases page](https://github.com/Suyooo/twitch-tgar-rating/releases) and download the ZIP! Download
the one for your OS (`linux`, `mac` or `win`) and architecture (in most cases: `arm` for Macs with M\* chips/Surface
devices/most SBCs like Raspberry Pi, `x64` otherwise). Extract the ZIP to an empty folder, then double-click the script
included (`run.sh`, `run.command` or `run.bat` depending on your OS) to start the server. The app will open in your
browser automatically!

Not working? Make sure you downloaded the ZIP for the right architecture, and double-check the architecture of your
system in the system settings of your OS. If you are using Mac or Linux, give the script file and executable in
`dist/node` permission to be executed if they don't have it. Try running the script from your terminal or command line
instead of double-clicking it, to see if it prints any error messages. You can
[open an Issue](https://github.com/Suyooo/twitch-tgar-rating/issues/new) if you need help with getting the server to run!

If you already have the NodeJS runtime installed on your computer, you can also just run `node dist/build` in your
terminal or command line. (The releases have been built with LTS v20.11.1.)

## How do I set it up?

If you use the Release ZIPs, the app will automatically open up in your browser once you start the server. You can also
find the URL in the server's output. Once you're in the app, it will show you the links you need to copy - one for the
Browser Source in OBS, and one to open in a new tab or window to control the overlay. You can find more information on
the page with the links. Check the "Styling" section below if you want to change the look of the overlay!

You can also run the stream on another machine than the one you run this server on, or have your control panel on
another device, like your phone - as long as they are on the same network as the server. For this, you need to replace
`localhost` in the control panel and stream overlay URLs you copy from your browser, with the local IP of the computer
that is hosting. How exactly you get those depends on your operating system - try searching for how to find your local
network IP. You might also need to allow the server to pass through the firewall on your computer (not the one on your
router!).

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

## Building

-   If you use Docker, you can simply run `docker build` and get a Docker container ready to run. You just need to add
    the environment variables and port mappings to the `run` command or Compose file.
-   Otherwise, you can build the project by running `npm run build`. You can then copy the `build` folder and
    `package.json` to wherever you want to run it from, where you can start it using `node build`, assuming Node is
    installed on the machine. Remember to set the environment variables.

In both cases, the app will run on port 3000 by default, which can be changed with the `PORT` environment variable. If
you are using a reverse proxy, [make sure to set it up correctly for Socket.IO in the `/socket.io` subpath](https://socket.io/docs/v4/reverse-proxy/).

## Neat stuff I used for this

-   [SvelteKit](https://kit.svelte.dev/)
-   [Socket.IO](https://socket.io/)
-   [tmi.js](https://tmijs.com/)
-   [IconSVG](https://iconsvg.xyz/)
