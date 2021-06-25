const config = require('@/config').value;
const devApiImpl = require('./user-impl/developer-api');
const webApiImpl = require('./user-impl/web-api');

module.exports = async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        await webApiImpl(ctx);
    } else {
        await devApiImpl(ctx);
    }
};
