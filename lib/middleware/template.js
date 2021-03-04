const art = require('art-template');
const path = require('path');
const config = require('@/config').value;
const typeRegex = /\.(atom|rss)$/;
const unsupportedRegex = /\.json$/;

module.exports = async (ctx, next) => {
    if (ctx.request.path.match(unsupportedRegex)) {
        throw Error('<b>JSON output had been removed, see: <a href="https://github.com/DIYgod/RSSHub/issues/1114">https://github.com/DIYgod/RSSHub/issues/1114</a></b>');
    }

    if (ctx.headers['user-agent'] && ctx.headers['user-agent'].includes('Reeder')) {
        ctx.request.path = ctx.request.path.replace(/.com$/, '');
    }

    ctx.state.type = ctx.request.path.match(typeRegex) || ['', ''];
    ctx.request.path = ctx.request.path.replace(typeRegex, '');

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
            ctx.state.data.item &&
                ctx.state.data.item.forEach((item) => {
                    if (item.title) {
                        item.title = item.title.trim();
                        // trim title length
                        for (let length = 0, i = 0; i < item.title.length; i++) {
                            length += Buffer.from(item.title[i]).length !== 1 ? 2 : 1;
                            if (length > config.titleLengthLimit) {
                                item.title = `${item.title.slice(0, i)}...`;
                                break;
                            }
                        }
                    }

                    if (item.enclosure_length) {
                        const itunes_duration =
                            Math.floor(item.enclosure_length / 3600) + ':' + (Math.floor((item.enclosure_length % 3600) / 60) / 100).toFixed(2).slice(-2) + ':' + (((item.enclosure_length % 3600) % 60) / 100).toFixed(2).slice(-2);
                        item.itunes_duration = itunes_duration;
                    }
                });
        }

        const routeTtl = (config.cache.routeExpire / 60) | 0;

        const data = {
            lastBuildDate: new Date().toUTCString(),
            updated: new Date().toISOString(),
            ttl: routeTtl,
            atomlink: ctx.request.href,
            ...ctx.state.data,
        };
        if (config.isPackage) {
            ctx.body = data;
        } else {
            if (template) {
                ctx.body = art(template, data);
            }
        }
    }
};
