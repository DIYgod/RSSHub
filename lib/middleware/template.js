const { art, json } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const typeRegex = /\.(atom|rss|debug\.json|json)$/;
const { collapseWhitespace, convertDateToISO8601 } = require('@/utils/common-utils');

module.exports = async (ctx, next) => {
    if (ctx.headers['user-agent'] && ctx.headers['user-agent'].includes('Reeder')) {
        ctx.request.path = ctx.request.path.replace(/.com$/, '');
    }

    ctx.state.type = ctx.request.path.match(typeRegex) || ['', ''];
    ctx.request.path = ctx.request.path.replace(typeRegex, '');

    await next();

    const outputType = ctx.state.type[1] || 'rss';

    if (outputType === 'debug.json' && config.debugInfo) {
        ctx.set({
            'Content-Type': 'application/json; charset=UTF-8',
        });
        if (ctx.state.json) {
            ctx.body = JSON.stringify(ctx.state.json, null, 4);
        } else {
            ctx.body = JSON.stringify({ message: 'plugin does not set debug json' });
        }
    }
    if (outputType === 'json') {
        ctx.set({ 'Content-Type': 'application/feed+json; charset=UTF-8' });
    }

    if (!ctx.body) {
        let template;

        switch (outputType) {
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
            ctx.state.data.title = collapseWhitespace(ctx.state.data.title);
            ctx.state.data.subtitle = collapseWhitespace(ctx.state.data.subtitle);
            ctx.state.data.author = collapseWhitespace(ctx.state.data.author);

            ctx.state.data.item &&
                ctx.state.data.item.forEach((item) => {
                    if (item.title) {
                        item.title = collapseWhitespace(item.title);
                        // trim title length
                        for (let length = 0, i = 0; i < item.title.length; i++) {
                            length += Buffer.from(item.title[i]).length !== 1 ? 2 : 1;
                            if (length > config.titleLengthLimit) {
                                item.title = `${item.title.slice(0, i)}...`;
                                break;
                            }
                        }
                    }

                    if (typeof item.author === 'string') {
                        item.author = collapseWhitespace(item.author);
                    } else if (typeof item.author === 'object' && item.author !== null) {
                        for (const a of item.author) {
                            a.name = collapseWhitespace(a.name);
                        }
                        if (outputType !== 'json') {
                            item.author = item.author.map((a) => a.name).join(', ');
                        }
                    }

                    if (item.itunes_duration && ((typeof item.itunes_duration === 'string' && item.itunes_duration.indexOf(':') === -1) || (typeof item.itunes_duration === 'number' && !isNaN(item.itunes_duration)))) {
                        item.itunes_duration = +item.itunes_duration;
                        item.itunes_duration =
                            Math.floor(item.itunes_duration / 3600) + ':' + (Math.floor((item.itunes_duration % 3600) / 60) / 100).toFixed(2).slice(-2) + ':' + (((item.itunes_duration % 3600) % 60) / 100).toFixed(2).slice(-2);
                    }

                    if (outputType !== 'rss') {
                        item.pubDate = convertDateToISO8601(item.pubDate);
                        item.updated = convertDateToISO8601(item.updated);
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
            return;
        }
        if (!template) {
            return;
        }
        if (outputType !== 'json') {
            ctx.body = art(template, data);
            return;
        }
        ctx.body = json(data);
    }
};
