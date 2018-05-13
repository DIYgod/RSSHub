const art = require('art-template');
const path = require('path');
const config = require('../config');

module.exports = async (ctx, next) => {
    await next();
    ctx.body = art(path.resolve(__dirname, '../views/rss.art'), {
        lastBuildDate: new Date().toUTCString(),
        ttl: config.cacheExpire,
        ...ctx.state.data,
    });
};