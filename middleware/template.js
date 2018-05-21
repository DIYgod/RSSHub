const art = require('art-template');
const path = require('path');
const config = require('../config');

module.exports = async (ctx, next) => {
    const type = ctx.request.path.match(/\.([a-z]+)$/) || ['', ''];

    switch (type[1]) {
        case 'atom':
            ctx.request.path = ctx.request.path.slice(0, -5);
            ctx.state.template = path.resolve(__dirname, '../views/atom.art');

            break;
        case 'rss':
            ctx.request.path = ctx.request.path.slice(0, -4);
            ctx.state.template = path.resolve(__dirname, '../views/rss.art');

            break;
        default:
            ctx.state.template = path.resolve(__dirname, '../views/rss.art');

            break;
    }

    await next();
    if (!ctx.body) {
        ctx.body = art(ctx.state.template, {
            lastBuildDate: new Date().toUTCString(),
            updated: new Date().toISOString(),
            ttl: config.cacheExpire,
            ...ctx.state.data,
        });
    }
};
