const logger = require('../utils/logger');

module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        logger.error('Promise error: ' + err);
        ctx.body = 'RSSHub 发生了一些意外: ' + err;
        ctx.status = 500;
    }
};