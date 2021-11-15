import etagCalculate from 'etag';
import logger from '~/utils/logger.js';
import { getGlobalConfig } from '~/config/index.js';
const config = getGlobalConfig();
const headers = {
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': `public, max-age=${config.cache.routeExpire}`,
    'X-Content-Type-Options': 'nosniff',
};
if (config.nodeName) {
    headers['RSSHub-Node'] = config.nodeName;
}

export default async (ctx, next) => {
    logger.info(`${ctx.url}, user IP: ${ctx.ips[0] || ctx.ip}`);
    ctx.set(headers);
    ctx.set({
        'Access-Control-Allow-Origin': config.allowOrigin || ctx.host,
    });

    await next();

    if (!ctx.body || typeof ctx.body !== 'string' || ctx.response.get('ETag')) {
        return;
    }

    const status = (ctx.status / 100) | 0;
    if (2 !== status) {
        return;
    }

    ctx.set('ETag', etagCalculate(ctx.body.replace(/<lastBuildDate>(.*)<\/lastBuildDate>/, '').replace(/<atom:link(.*)\/>/, '')));

    if (ctx.fresh) {
        ctx.status = 304;
        ctx.body = null;
    } else {
        const match = ctx.body.match(/<lastBuildDate>(.*)<\/lastBuildDate>/);
        if (match) {
            ctx.set({
                'Last-Modified': match[1],
            });
        }
    }
};
