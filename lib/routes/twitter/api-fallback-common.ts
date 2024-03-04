// @ts-nocheck
import { config } from '@/config';
import logger from '@/utils/logger';
const utils = require('./utils');

module.exports = async (ctx, devApiImpl, webApiImpl) => {
    const { force_web_api } = utils.parseRouteParams(ctx.req.param('routeParams'));

    if (!force_web_api && config.twitter && config.twitter.consumer_key && config.twitter.consumer_secret) {
        try {
            await devApiImpl(ctx);
            return;
        } catch (error) {
            logger.error(`Fallback to Twitter web API due to developer API error:\n${error.stack}`);
        }
    }
    await webApiImpl(ctx);
};
