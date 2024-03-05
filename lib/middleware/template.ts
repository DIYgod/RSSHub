import { rss3Ums, json, art } from '@/utils/render';
import * as path from 'node:path';
import { config } from '@/config';
import { collapseWhitespace, convertDateToISO8601 } from '@/utils/common-utils';
import type { MiddlewareHandler } from 'hono';
import { Data } from '@/types';

import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

const middleware: MiddlewareHandler = async (ctx, next) => {
    await next();

    const data: Data = ctx.get('data');
    const outputType = ctx.req.query('format') || 'rss';

    // only enable when debugInfo=true
    if (config.debugInfo) {
        if (outputType === 'debug.json') {
            return ctx.json(ctx.get('json') || { message: 'plugin does not set debug json' });
        }

        if (/(\d+)\.debug\.html$/.test(outputType)) {
            const index = Number.parseInt(outputType.match(/(\d+)\.debug\.html$/)?.[1] || '0');
            return ctx.html(data?.item?.[index]?.description || `data.item[${index}].description not found`);
        }
    }

    const templateName = outputType === 'atom' ? 'atom.art' : 'rss.art';
    const template = path.resolve(__dirname, `../views/${templateName}`);

    if (data) {
        data.title = collapseWhitespace(data.title) || '';
        data.description && (data.description = collapseWhitespace(data.description) || '');
        data.author && (data.author = collapseWhitespace(data.author) || '');

        if (data.item) {
            for (const item of data.item) {
                if (item.title) {
                    item.title = collapseWhitespace(item.title) || '';
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
                    item.author = collapseWhitespace(item.author) || '';
                } else if (typeof item.author === 'object' && item.author !== null) {
                    for (const a of item.author) {
                        a.name = collapseWhitespace(a.name) || '';
                    }
                    if (outputType !== 'json') {
                        item.author = item.author.map((a: { name: string }) => a.name).join(', ');
                    }
                }

                if (item.itunes_duration && ((typeof item.itunes_duration === 'string' && !item.itunes_duration.includes(':')) || (typeof item.itunes_duration === 'number' && !Number.isNaN(item.itunes_duration)))) {
                    item.itunes_duration = +item.itunes_duration;
                    item.itunes_duration =
                        Math.floor(item.itunes_duration / 3600) + ':' + (Math.floor((item.itunes_duration % 3600) / 60) / 100).toFixed(2).slice(-2) + ':' + (((item.itunes_duration % 3600) % 60) / 100).toFixed(2).slice(-2);
                }

                if (outputType !== 'rss') {
                    item.pubDate && (item.pubDate = convertDateToISO8601(item.pubDate) || '');
                    item.updated && (item.updated = convertDateToISO8601(item.updated) || '');
                }
            }
        }
    }

    const currentDate = new Date();
    const result = {
        lastBuildDate: currentDate.toUTCString(),
        updated: currentDate.toISOString(),
        ttl: Math.trunc(config.cache.routeExpire / 60),
        atomlink: ctx.req.url,
        ...data,
    };

    if (config.isPackage) {
        return ctx.json(result);
    }

    if (outputType === 'ums') {
        return ctx.json(rss3Ums(result));
    } else if (outputType === 'json') {
        ctx.header('Content-Type', 'application/feed+json; charset=UTF-8');
        return ctx.body(json(result));
    } else if (ctx.get('no-content')) {
        return ctx.body(null);
    } else {
        return ctx.body(art(template, result));
    }
};

export default middleware;
