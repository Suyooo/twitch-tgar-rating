import { create } from 'simple-oauth2';

const oauth = create({
	client: {
		id: process.env.TWITCH_APP_ID,
		secret: process.env.TWITCH_APP_SECRET
	},
	auth: {
		tokenHost: 'https://id.twitch.tv',
		tokenPath: '/oauth2/token',
		authorizePath: '/oauth2/authorize'
	}
});
