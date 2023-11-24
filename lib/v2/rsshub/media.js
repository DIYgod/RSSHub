const got = require('@/utils/got');
const config = require('@/config').value;

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

    const refererMap = new Map([
        ['fbcdn.net', 'https://www.facebook.com/'],
        ['cdninstagram.com', 'https://www.instagram.com/'],
        ['moyu.im', 'https://jandan.net/'],
        ['pximg.net', 'https://www.pixiv.net/'],
        ['me8gs.app', 'https://www.sehuatang.net/'],
        ['rxn30.app', 'https://www.sehuatang.net/'],
        ['sex.com', 'https://www.sex.com/'],
        ['sinaimg.cn', 'https://weibo.com/'],
    ]);

    const referer = refererMap.get(hostname.split('.').slice(-2).join('.')) || origin;

    const { headers } = await got.head(url, {
        headers: {
            referer,
        },
    });

    const cacheControl = headers['cache-control'];
    const contentType = headers['content-type'];
    const contentLength = headers['content-length'];

    if (!contentType.startsWith('image/') || headers['x-powered-by'] === 'RSSHub') {
        ctx.redirect(url);
        return;
    }

    ctx.set({
        'cache-control': cacheControl || `public, max-age=${config.cache.contentExpire}`,
        'content-length': contentLength,
        'content-type': contentType,
        'x-powered-by': 'RSSHub',
    });

    ctx.body = await got.stream(url, {
        headers: {
            referer,
        },
    });
};
