const art = require('art-template');
const path = require('path');
const config = require('../config');

module.exports = async (ctx, next) => {
    const pathname = ctx.request.path;

    const paterns = [
        () => {
            const patern = '.atom';
            if (pathname.endsWith(patern)) {
                ctx.request.path = pathname.slice(0, -patern.length);
                ctx.state.template = path.resolve(__dirname, '../views/atom.art');

                return true;
            }
        },
        () => {
            const patern = '.rss';
            if (pathname.endsWith(patern)) {
                ctx.request.path = pathname.slice(0, -patern.length);
                ctx.state.template = path.resolve(__dirname, '../views/rss.art');

                return true;
            }
        },
        () => {
            // default
            ctx.state.template = path.resolve(__dirname, '../views/rss.art');

            return true;
        },
    ];

    paterns.find((p) => p());

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
