import { MiddlewareHandler } from 'hono';
import { routePath } from 'hono/route';
import etagCalculate from 'etag';
import { config } from '@/config';
import { Data } from '@/types';

const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': `public, max-age=${config.cache.routeExpire}`,
    'X-Content-Type-Options': 'nosniff',
};
if (config.nodeName) {
    headers['RSSHub-Node'] = config.nodeName;
}

function etagMatches(etag: string, ifNoneMatch: string | null) {
    return ifNoneMatch !== null && ifNoneMatch.split(/,\s*/).includes(etag);
}

const middleware: MiddlewareHandler = async (ctx, next) => {
    for (const key in headers) {
        ctx.header(key, headers[key]);
    }
    ctx.header('Access-Control-Allow-Origin', config.allowOrigin || new URL(ctx.req.url).host);

    await next();
    const rPath = routePath(ctx);

    if (rPath !== '/*') {
        ctx.header('X-RSSHub-Route', rPath);
    }

    const data: Data = ctx.get('data');
    if (!data || ctx.res.headers.get('ETag')) {
        return;
    }

    const lastBuildDate = data.lastBuildDate;
    delete data.lastBuildDate;
    const etag = etagCalculate(JSON.stringify(data));

    ctx.header('ETag', etag);

    const ifNoneMatch = ctx.req.header('If-None-Match') ?? null;
    if (etagMatches(etag, ifNoneMatch)) {
        ctx.status(304);
        ctx.set('no-content', true);
    } else {
        ctx.header('Last-Modified', lastBuildDate);
    }
};

export default middleware;
