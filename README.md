# TGAR Twitch Rating

A little Twitch bot to read chat's opinion. Originally made for ["This Game Ain't Real"](https://thisgameaintreal.carrd.co/)
(specifically the Game of The Year variant), but it can be used for anything that needs chat to give a rating out of ten.

![Example GIF showing the stream overlay](example.gif?raw=true)

## How does it work?

The stream overlay is a web page embedded via OBS' Browser Source, and controlled via a seperate web page that can be
either opened on the side or on another device. When you start a poll, the bot will join your channel as an anonymous
guest user - no passwords or permissions needed - to read the chat there, and records messages containing ratings.

## How can I run it?

To quickly run this on your own machine, download this repo and install the Node.JS runtime (tested on LTS version 20).
On your terminal, run `npm install` to download dependencies.

Create a file called `.env`, and put `PUBLIC_APP_URL=http://localhost:5173`. Then run `npm run dev` to start the app.
Once it's ready, visit `http://localhost:5173` in your browser to get started.
