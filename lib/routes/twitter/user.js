const config = require('@/config').value;
const devApiImpl = require('./developer-api/user');
const webApiImpl = require('./web-api/user');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    if (config.twitter && config.twitter.consumer_key && config.twitter.consumer_secret) {
        try {
            await devApiImpl(ctx);
            return;
        } catch (e) {
            logger.error(`Fallback to Twitter web API due to developer API error:\n${e.stack}`);
        }
    }
    await webApiImpl(ctx);
};
