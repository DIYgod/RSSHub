const got = require('@/utils/got');
const config = require('@/config').value;
const { getDomain } = require('tldts');
const { refererMap } = require('./referer-map');

module.exports = async (ctx) => {
    if (!config.feature.mediaProxyKey) {
        ctx.throw(403, 'Internal media proxy is disabled.');
    }

    const { key } = ctx.params;
    if (key !== config.feature.mediaProxyKey) {
        ctx.throw(401, 'Invalid media proxy key.');
    }

    const url = decodeURIComponent(ctx.params.url);
    const requestUrl = new URL(url);
    const { hostname, origin } = requestUrl;

    const domain = getDomain(hostname);

    let referer = refererMap.get(domain);
    referer ||= origin;

    const { headers } = await got.head(url, {
        headers: {
            referer,
        },
    });

    const cacheControl = headers['cache-control'];
    const contentType = headers['content-type'];
    const contentLength = headers['content-length'];

    if (!contentType.startsWith('image/') || headers.server === 'RSSHub') {
        return ctx.redirect(url);
    }

    ctx.set({
        'cache-control': cacheControl || `public, max-age=${config.cache.contentExpire}`,
        'content-length': contentLength,
        'content-type': contentType,
        server: 'RSSHub',
    });

    ctx.body = await got.stream(url, {
        headers: {
            referer,
        },
    });
};
