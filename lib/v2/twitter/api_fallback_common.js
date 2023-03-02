const config = require('@/config').value;
const logger = require('@/utils/logger');
const utils = require('./utils');

module.exports = async (ctx, devApiImpl, webApiImpl) => {
    const { force_web_api } = utils.parseRouteParams(ctx.params.routeParams);

    if (!force_web_api && config.twitter && config.twitter.consumer_key && config.twitter.consumer_secret) {
        try {
            await devApiImpl(ctx);
            return;
        } catch (e) {
            logger.error(`Fallback to Twitter web API due to developer API error:\n${e.stack}`);
        }
    }
    await webApiImpl(ctx);
};
