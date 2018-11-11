const art = require('art-template');
const path = require('path');
const config = require('../config');
const he = require('he');
const typeRegrx = /\.(atom|rss)$/;

module.exports = async (ctx, next) => {
    ctx.state.type = ctx.request.path.match(typeRegrx) || ['', ''];
    ctx.request.path = ctx.request.path.replace(typeRegrx, '');

    await next();

    if (!ctx.body) {
        let template;

        switch (ctx.state.type[1]) {
            case 'atom':
                template = path.resolve(__dirname, '../views/atom.art');
                break;
            case 'rss':
                template = path.resolve(__dirname, '../views/rss.art');
                break;
            default:
                template = path.resolve(__dirname, '../views/rss.art');
                break;
        }

        if (ctx.state.data) {
            // trim title length
            ctx.state.data.item &&
                ctx.state.data.item.forEach((item) => {
                    if (item.title) {
                        for (let length = 0, i = 0; i < item.title.length; i++) {
                            length += Buffer.from(item.title[i]).length !== 1 ? 2 : 1;
                            if (length > config.titleLengthLimit) {
                                item.title = `${item.title.slice(0, i)}...`;
                                break;
                            }
                        }
                    }
                });

            // decode HTML entities
            ctx.state.data.title && (ctx.state.data.title = he.decode(ctx.state.data.title));
            ctx.state.data.description && (ctx.state.data.description = he.decode(ctx.state.data.description));
            ctx.state.data.item &&
                ctx.state.data.item.forEach((item) => {
                    item.title && (item.title = he.decode(item.title));
                    item.description && (item.description = he.decode(item.description));
                });
        }

        const data = {
            lastBuildDate: new Date().toUTCString(),
            updated: new Date().toISOString(),
            ttl: config.cacheExpire,
            ...ctx.state.data,
        };
        if (template) {
            ctx.body = art(template, data);
        }
    }
};
