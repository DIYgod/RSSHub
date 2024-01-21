import { getIp } from "@/utils/helpers";
import { MiddlewareHandler } from "hono";
import etagCalculate from "etag";
import logger from "@/utils/logger";
import { config } from "@/config";

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
    return ifNoneMatch != null && ifNoneMatch.split(/,\s*/).indexOf(etag) > -1
}

const middleware: MiddlewareHandler = async (ctx, next) => {
    const ip = getIp(ctx);
    logger.info(`${ctx.req.url}, user IP: ${ip}`);

    for (const key in headers) {
        ctx.header(key, headers[key])
    }
    ctx.header('Access-Control-Allow-Origin', config.allowOrigin || new URL(ctx.req.url).host);

    await next();

    if (!ctx.res.body || ctx.res.headers.get('ETag')) {
        return;
    }

    const status = Math.trunc(ctx.res.status / 100);
    if (2 !== status) {
        return;
    }

    const res = ctx.res as Response;
    const body = await res.clone().text();
    const etag = etagCalculate(body.replace(/<lastBuildDate>(.*)<\/lastBuildDate>/, '').replace(/<atom:link(.*)\/>/, ''));

    ctx.set('ETag', etag);

    const ifNoneMatch = ctx.req.header('If-None-Match') ?? null;
    if (etagMatches(etag, ifNoneMatch)) {
        ctx.status(304);
        ctx.body(null);
    } else {
        const match = body.match(/<lastBuildDate>(.*)<\/lastBuildDate>/);
        if (match) {
            ctx.header('Last-Modified', match[1]);
        }
    }
};

export default middleware;