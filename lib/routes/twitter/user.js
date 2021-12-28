const config = require('@/config').value;
const devApiImpl = require('./developer-api/user');
const webApiImpl = require('./web-api/user');

module.exports = async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        await webApiImpl(ctx);
    } else {
        await devApiImpl(ctx);
    }
};
