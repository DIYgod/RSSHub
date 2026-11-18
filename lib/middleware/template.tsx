import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import type { Data } from '@/types';
import cacheModule from '@/utils/cache/index';
import { collapseWhitespace } from '@/utils/common-utils';
import { Atom, json, RSS, rss3 } from '@/utils/render';
import { parseDuration, toInstant, toISOString, toRFC822 } from '@/utils/time';

// https://stackoverflow.com/questions/2507608/error-input-is-not-proper-utf-8-indicate-encoding-using-phps-simplexml-lo/40552083#40552083
// https://stackoverflow.com/questions/1497885/remove-control-characters-from-php-string/1497928#1497928
// remove unicode control characters, escaping does not make them valid in XML
// see #14940 #14943 #15262
// oxlint-disable-next-line no-control-regex
const controlCharacters = /[\u{0000}-\u{0009}\v\f\u{000E}-\u{001F}\u{007F}\u{200B}\u{FFFE}\u{FFFF}]/gu;

const removeControlCharacters = <T,>(value: T): T => {
    if (typeof value === 'string') {
        return value.replaceAll(controlCharacters, '') as T;
    }
    if (Array.isArray(value) || (value && Object.getPrototypeOf(value) === Object.prototype)) {
        for (const key of Object.keys(value)) {
            value[key] = removeControlCharacters(value[key]);
        }
    }
    return value;
};

const middleware: MiddlewareHandler = async (ctx, next) => {
    // Set RSS <ttl> (minute) according to the availability of cache
    // * available: max(config.cache.routeExpire / 60, 1)
    // * unavailable: 1
    // The minimum <ttl> is limited to 1 minute to prevent potential misuse
    const ttl = (cacheModule.status.available && Math.trunc(config.cache.routeExpire / 60)) || 1;
    await next();

    const apiData = ctx.get('apiData');
    if (apiData) {
        return ctx.json(apiData);
    }

    const data: Data = ctx.get('data');
    const outputType = ctx.req.query('format') || config.format;

    // only enable when DEBUG_INFO=true, or when the request carries the configured debug secret
    const debugEnabled = !!config.debugInfo && config.debugInfo !== 'false' && (config.debugInfo === 'true' || config.debugInfo === ctx.req.query('debug'));
    if (debugEnabled) {
        if (outputType === 'debug.json') {
            return ctx.json(ctx.get('json') || { message: 'plugin does not set debug json' });
        }

        if (/\d+\.debug\.html$/.test(outputType)) {
            const index = Number.parseInt(outputType.match(/(\d+)\.debug\.html$/)?.[1] || '0');
            // the description is upstream HTML, so show it in an opaque origin without scripts
            ctx.header('Content-Security-Policy', "sandbox; default-src 'none'; img-src * data:; media-src *; style-src 'unsafe-inline'");
            return ctx.html(data?.item?.[index]?.description || `data.item[${index}].description not found`);
        }
    }

    if (data) {
        data.title = collapseWhitespace(data.title) || '';
        data.description &&= collapseWhitespace(data.description) || '';
        data.author &&= collapseWhitespace(data.author) || '';

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

                if (Array.isArray(item.author)) {
                    for (const a of item.author) {
                        a.name = collapseWhitespace(a.name) || '';
                    }
                    if (outputType !== 'json') {
                        item.author = item.author.map((a) => a.name).join(', ');
                    }
                } else if (item.author) {
                    item.author = collapseWhitespace(item.author) || '';
                }

                item.itunes_duration = parseDuration(item.itunes_duration);

                if (outputType === 'rss') {
                    continue;
                }
                const pubDate = item.pubDate ? toInstant(item.pubDate) : undefined;
                item.pubDate = pubDate && toISOString(pubDate);
                const updated = item.updated ? toInstant(item.updated) : undefined;
                item.updated = updated && toISOString(updated);
            }
        }

        // any field may carry upstream text into the feed, not only item.description
        removeControlCharacters(data);
    }

    const currentDate = Temporal.Now.instant();
    const result = {
        lastBuildDate: toRFC822(currentDate),
        updated: toISOString(currentDate),
        ttl,
        atomlink: ctx.req.url,
        ...data,
    };

    if (config.isPackage) {
        return ctx.json(result);
    }

    if (ctx.get('redirect')) {
        return ctx.redirect(ctx.get('redirect'), 301);
    }
    if (ctx.get('no-content')) {
        return ctx.body(null);
    }
    // retain .ums for backward compatibility
    switch (outputType) {
        case 'ums':
        case 'rss3':
            return ctx.json(rss3(result));
        case 'json':
            ctx.header('Content-Type', 'application/feed+json; charset=UTF-8');
            return ctx.body(json(result));
        case 'atom':
            return ctx.render(<Atom data={result} />);
        default:
            return ctx.render(<RSS data={result} />);
    }
};

export default middleware;
