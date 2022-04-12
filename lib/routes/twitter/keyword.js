const config = require('@/config').value;
const webApiImpl = require('./web-api/search');
const devApiImpl = require('./developer-api/search');
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
