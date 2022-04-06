const art = require('art-template');
const path = require('path');
const config = require('@/config').value;
const typeRegex = /\.(atom|rss|debug\.json)$/;
const { collapseWhitespace, convertDateToISO8601, convertDateToRFC2822 } = require('@/utils/common-utils');

module.exports = async (ctx, next) => {
    if (ctx.headers['user-agent'] && ctx.headers['user-agent'].includes('Reeder')) {
        ctx.request.path = ctx.request.path.replace(/.com$/, '');
    }

    ctx.state.type = ctx.request.path.match(typeRegex) || ['', ''];
    ctx.request.path = ctx.request.path.replace(typeRegex, '');

    await next();

    if (ctx.state.type[1] === 'debug.json' && config.debugInfo) {
        ctx.set({
            'Content-Type': 'application/json; charset=UTF-8',
        });
        if (ctx.state.json) {
            ctx.body = JSON.stringify(ctx.state.json, null, 4);
        } else {
            ctx.body = JSON.stringify({ message: 'plugin does not set json' });
        }
    }

    if (!ctx.body) {
        let template;

        const outputType = ctx.state.type[1];
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

                    item.author = collapseWhitespace(item.author);

                    if (item.itunes_duration && ((typeof item.itunes_duration === 'string' && item.itunes_duration.indexOf(':') === -1) || (typeof item.itunes_duration === 'number' && !isNaN(item.itunes_duration)))) {
                        item.itunes_duration = +item.itunes_duration;
                        item.itunes_duration =
                            Math.floor(item.itunes_duration / 3600) + ':' + (Math.floor((item.itunes_duration % 3600) / 60) / 100).toFixed(2).slice(-2) + ':' + (((item.itunes_duration % 3600) % 60) / 100).toFixed(2).slice(-2);
                    }

                    if (outputType === 'atom') {
                        item.pubDate = convertDateToISO8601(item.pubDate);
                        item.updated = convertDateToISO8601(item.updated);
                    } else {
                        // There are three reasons why we need to ensure the date string is in RFC2822 and is in UTC:
                        // 1.
                        // If the timezone of the Date object is not UTC,
                        // `Date.toString()` will return the date WITH the name of the timezone, which does not conform to RFC2822.
                        // Meanwhile, the timezone name is in the local language of the host, making things worse.
                        // "Wed Apr 06 2022 16:53:37 GMT+0800 (中国标准时间)"
                        //
                        // 2.
                        // According to the documentation, `pubDate` SHOULD be a Date object,
                        // however, after being JSON-stringified then JSON-parsed, it will become an ISO8601 string.
                        // Unfortunately, a lot of routes cache their items barely,
                        // making the cached `pubDate`s become ISO8601 strings...
                        //
                        // 3.
                        // Ensure throwing an error when the date is invalid. Never let mistakes escape.
                        item.pubDate = convertDateToRFC2822(item.pubDate);
                        // item.updated = convertDateToRFC2822(item.updated); // RSS2.0 does not have this field
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
