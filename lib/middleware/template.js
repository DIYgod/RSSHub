const { art, json, rss3Ums } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const typeRegex = /\.(atom|rss|ums|debug\.json|json|\d+\.debug\.html)$/;
const { collapseWhitespace, convertDateToISO8601 } = require('@/utils/common-utils');

module.exports = async (ctx, next) => {
    if (ctx.headers['user-agent'] && ctx.headers['user-agent'].includes('Reeder')) {
        ctx.request.path = ctx.request.path.replace(/.com$/, '');
    }

    ctx.state.type = ctx.request.path.match(typeRegex) || ['', ''];
    ctx.request.path = ctx.request.path.replace(typeRegex, '');

    await next();

    const outputType = ctx.state.type[1] || 'rss';

    // only enable when debugInfo=true
    if (config.debugInfo) {
        if (outputType === 'debug.json') {
            ctx.set({
                'Content-Type': 'application/json; charset=UTF-8',
            });
            ctx.body = ctx.state.json ? JSON.stringify(ctx.state.json, null, 4) : JSON.stringify({ message: 'plugin does not set debug json' });
        }

        if (outputType.endsWith('.debug.html')) {
            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
            });

            const index = Number.parseInt(outputType.match(/(\d+)\.debug\.html$/)[1]);
            ctx.body = ctx.state.data && ctx.state.data.item && ctx.state.data.item[index] ? ctx.state.data.item[index].description : `ctx.state.data.item[${index}] not found`;
        }
    }

    if (!ctx.body) {
        const templateName = outputType === 'atom' ? 'atom.art' : 'rss.art';
        const template = path.resolve(__dirname, `../views/${templateName}`);

        if (ctx.state.data) {
            const collapseWhitespaceForProperties = (properties, obj) => {
                for (const prop of properties) {
                    if (obj[prop]) {
                        obj[prop] = collapseWhitespace(obj[prop]);
                    }
                }
            };

            collapseWhitespaceForProperties(['title', 'subtitle', 'author'], ctx.state.data);

            if (ctx.state.data.item) {
                for (const item of ctx.state.data.item) {
                    if (item.title) {
                        item.title = collapseWhitespace(item.title);
                        // trim title length
                        for (let length = 0, i = 0; i < item.title.length; i++) {
                            length += Buffer.from(item.title[i]).length === 1 ? 1 : 2;
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

                    if (item.itunes_duration && ((typeof item.itunes_duration === 'string' && !item.itunes_duration.includes(':')) || (typeof item.itunes_duration === 'number' && !isNaN(item.itunes_duration)))) {
                        item.itunes_duration = +item.itunes_duration;
                        item.itunes_duration =
                            Math.floor(item.itunes_duration / 3600) + ':' + (Math.floor((item.itunes_duration % 3600) / 60) / 100).toFixed(2).slice(-2) + ':' + (((item.itunes_duration % 3600) % 60) / 100).toFixed(2).slice(-2);
                    }

                    if (outputType !== 'rss') {
                        item.pubDate = convertDateToISO8601(item.pubDate);
                        item.updated = convertDateToISO8601(item.updated);
                    }
                }
            }
        }

        const currentDate = new Date();
        const data = {
            lastBuildDate: currentDate.toUTCString(),
            updated: currentDate.toISOString(),
            ttl: Math.trunc(config.cache.routeExpire / 60),
            atomlink: ctx.request.href,
            ...ctx.state.data,
        };

        if (config.isPackage) {
            ctx.body = data;
            return;
        }

        if (outputType === 'ums') {
            ctx.set({ 'Content-Type': 'application/json; charset=UTF-8' });
            ctx.body = rss3Ums(data);
        } else if (outputType === 'json') {
            ctx.set({ 'Content-Type': 'application/feed+json; charset=UTF-8' });
            ctx.body = json(data);
        } else {
            ctx.body = art(template, data);
        }
    }
};
