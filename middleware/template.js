const art = require('art-template');
const path = require('path');
const config = require('../config');
const typeRegrx = /\.(atom|rss|json)$/;

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
            case 'json':
                template = path.resolve(__dirname, '../views/json.art');
                ctx.set({
                    'Content-Type': 'application/json; charset=UTF-8',
                });
                break;
            default:
                template = path.resolve(__dirname, '../views/rss.art');
                break;
        }
        // trim title length
        ctx.state.data.item.forEach((item) => {
            for (let length = 0, i = 0; i < item.title.length; i++) {
                length += Buffer.from(item.title[i]).length !== 1 ? 2 : 1;
                if (length > config.titleLengthLimit) {
                    item.title = `${item.title.slice(0, i)}...`;
                    break;
                }
            }
        });

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
