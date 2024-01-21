import render from '@/utils/render';
import * as path from 'node:path';
import { config } from '@/config';
const typeRegex = /\.(atom|rss|ums|debug\.json|json|\d+\.debug\.html)$/;
import utils from '@/utils/common-utils';
import type { MiddlewareHandler } from 'hono';

const middleware: MiddlewareHandler = async (ctx, next) => {
    if (ctx.req.header('user-agent')?.includes('Reeder')) {
        ctx.req.path = ctx.req.path.replace(/.com$/, '');
    }

    ctx.set('type', ctx.req.path.match(typeRegex) || ['', '']);
    ctx.req.path = ctx.req.path.replace(typeRegex, '');

    await next();

    const outputType = ctx.get('type')[1] || 'rss';

    // only enable when debugInfo=true
    if (config.debugInfo) {
        if (outputType === 'debug.json') {
            ctx.header('Content-Type', 'application/json; charset=UTF-8');
            return ctx.body(ctx.get('json') ? JSON.stringify(ctx.get('json'), null, 4) : JSON.stringify({ message: 'plugin does not set debug json' }));
        }

        if (outputType.endsWith('.debug.html')) {
            ctx.header('Content-Type', 'text/html; charset=UTF-8');

            const index = Number.parseInt(outputType.match(/(\d+)\.debug\.html$/)[1]);
            return ctx.body(ctx.get('data')?.item?.[index]?.description || `ctx.get('data')?.item?.[${index}]?.description not found`);
        }
    }

        const templateName = outputType === 'atom' ? 'atom.art' : 'rss.art';
        const template = path.resolve(__dirname, `../views/${templateName}`);

        if (ctx.get('data')) {
            for (const prop of ['title', 'subtitle', 'author']) {
                if (ctx.get('data')[prop]) {
                    ctx.get('data')[prop] = utils.collapseWhitespace(ctx.get('data')[prop]);
                }
            }

            if (ctx.get('data').item) {
                for (const item of ctx.get('data').item) {
                    if (item.title) {
                        item.title = utils.collapseWhitespace(item.title);
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
                        item.author = utils.collapseWhitespace(item.author);
                    } else if (typeof item.author === 'object' && item.author !== null) {
                        for (const a of item.author) {
                            a.name = utils.collapseWhitespace(a.name);
                        }
                        if (outputType !== 'json') {
                            item.author = item.author.map((a: {
                                name: string;
                            }) => a.name).join(', ');
                        }
                    }

                    if (item.itunes_duration && ((typeof item.itunes_duration === 'string' && !item.itunes_duration.includes(':')) || (typeof item.itunes_duration === 'number' && !isNaN(item.itunes_duration)))) {
                        item.itunes_duration = +item.itunes_duration;
                        item.itunes_duration =
                            Math.floor(item.itunes_duration / 3600) + ':' + (Math.floor((item.itunes_duration % 3600) / 60) / 100).toFixed(2).slice(-2) + ':' + (((item.itunes_duration % 3600) % 60) / 100).toFixed(2).slice(-2);
                    }

                    if (outputType !== 'rss') {
                        item.pubDate = utils.convertDateToISO8601(item.pubDate);
                        item.updated = utils.convertDateToISO8601(item.updated);
                    }
                }
            }
        }

        const currentDate = new Date();
        const data = {
            lastBuildDate: currentDate.toUTCString(),
            updated: currentDate.toISOString(),
            ttl: Math.trunc(config.cache.routeExpire / 60),
            atomlink: ctx.req.url,
            ...ctx.get('data'),
        };

        if (config.isPackage) {
            return ctx.body(data);
        }

        if (outputType === 'ums') {
            ctx.header('Content-Type', 'application/json; charset=UTF-8');
            return ctx.body(render.rss3Ums(data));
        } else if (outputType === 'json') {
            ctx.header('Content-Type', 'application/feed+json; charset=UTF-8');
            return ctx.body(render.json(data));
        } else {
            return ctx.body(render.art(template, data));
        }
};

export default middleware;
