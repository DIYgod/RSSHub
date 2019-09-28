const etagCalculate = require('etag');
const logger = require('@/utils/logger');
const config = require('@/config').value;
const headers = {
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': `public, max-age=${config.cache.routeExpire}`,
};
if (config.nodeName) {
    headers['RSSHub-Node'] = config.nodeName;
}

module.exports = async (ctx, next) => {
    logger.info(`${ctx.url}, user IP: ${ctx.ips[0] || ctx.ip}`);
    ctx.set(headers);
    ctx.set({
        'Access-Control-Allow-Origin': `${ctx.host}`,
    });

    await next();

    let body = ctx.body;
    if (!body || typeof body !== 'string' || ctx.response.get('ETag')) {
        return;
    }

    const status = (ctx.status / 100) | 0;
    if (2 !== status) {
        return;
    }

    const match = body.match(/<lastBuildDate>(.*)<\/lastBuildDate>/);
    if (match) {
        ctx.set({
            'Last-Modified': body.match(/<lastBuildDate>(.*)<\/lastBuildDate>/)[1],
        });
    }

    body = body.replace(/<lastBuildDate>(.*)<\/lastBuildDate>/, '');

    ctx.response.etag = etagCalculate(body);
};
