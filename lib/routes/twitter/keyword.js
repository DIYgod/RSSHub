import { config } from '~/config.js';
const webApiImpl = require('./web-api/search');
const devApiImpl = require('./developer-api/search');

export default async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        await webApiImpl(ctx);
    } else {
        await devApiImpl(ctx);
    }
};
