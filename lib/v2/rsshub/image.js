const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.feature.imageProxyKey) {
        ctx.throw(403, 'Image proxy is disabled.');
    }

    const { key } = ctx.params;
    if (key !== config.feature.imageProxyKey) {
        ctx.throw(401, 'Invalid image proxy key.');
    }

    const url = decodeURIComponent(ctx.params.url);
    const requestUrl = new URL(url);
    const { hostname, origin } = requestUrl;

    let referer;
    if (hostname.endsWith('me8gs.app')) {
        referer = 'https://www.sehuatang.net/';
    } else if (hostname.endsWith('moyu.im')) {
        referer = 'https://jandan.net/';
    } else if (hostname.endsWith('pximg.net')) {
        referer = 'https://www.pixiv.net/';
    } else {
        referer = origin;
    }

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
