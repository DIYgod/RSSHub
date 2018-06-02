const logger = require('../utils/logger');
const config = require('../config');
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild',
    'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS',
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': `max-age=${config.cacheExpire / 2}`,
};

module.exports = async (ctx, next) => {
    logger.info(`${ctx.url}, user IP: ${ctx.ips[0] || ctx.ip}`);
    ctx.set(headers);
    await next();
};
