const logger = require('../utils/logger');

module.exports = async (ctx, next) => {
    logger.info(`${ctx.url}, user IP: ${ctx.ip}`);

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild',
        'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS',
        'Content-Type': 'application/xml; charset=utf-8',
    };
    ctx.set(headers);
    await next();
};