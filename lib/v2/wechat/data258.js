const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { finishArticleItem } = require('@/utils/wechat-mp');
const { RequestInProgressError } = require('@/errors');
const wait = require('@/utils/wait');

const parsePage = ($item, hyperlinkSelector, timeSelector) => {
    const hyperlink = $item.find(hyperlinkSelector);
    const title = hyperlink.text();
    const link = hyperlink.attr('href');
    const pubDate = timezone(parseDate($item.find(timeSelector).text(), 'YYYY-MM-DD HH:mm'), 8);
    return {
        title,
        link,
        pubDate,
    };
};

module.exports = async (ctx) => {
    // !!! here we must use a lock to prevent other requests to break the anti-anti-crawler workarounds !!!
    if ((await ctx.cache.get('data258:lock', false)) === '1') {
        throw new RequestInProgressError('Another request is in progress, please try again later.');
    }
    // !!! here no need to acquire the lock, because the MP/category page has no crawler detection !!!

    const id = ctx.params.id;

    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 5;

    const rootUrl = 'https://mp.data258.com';
    const pageUrl = id ? `${rootUrl}/article/category/${id}` : rootUrl;

    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);

    const title = $('head title').text();
    // title = title.endsWith('-微阅读') ? title.slice(0, title.length - 4) : title;
    const description = $('meta[name="description"]').attr('content');

    const categoryPage = $('ul.fly-list');

    let items;
    if (categoryPage && categoryPage.length) {
        // got a category page
        items = $(categoryPage)
            .find('li')
            .map((_, item) => parsePage($(item), 'h2 a', '.fly-list-info span'))
            .get();
    } else {
        // got an MP page
        items = $('ul.jie-row li')
            .map((_, item) => parsePage($(item), 'a.jie-title', '.layui-hide-xs'))
            .get();
    }

    items = items.slice(0, limit); // limit to avoid being anti-crawled

    // !!! double-check !!!
    if ((await ctx.cache.get('data258:lock', false)) === '1') {
        throw new RequestInProgressError('Another request is in progress, please try again later.');
    } else {
        // !!! here we acquire the lock because the jump page has crawler detection !!!
        await ctx.cache.set('data258:lock', '1', 60);
    }

    // !!! here we must use a for-loop to ensure the concurrency is 1 !!!
    // !!! please do note that if you try to increase the concurrency, your IP will be banned for a long time !!!

    let err; // !!! let RSSHub throw an anti-crawler prompt if the route is empty !!!

    /* eslint-disable no-await-in-loop */
    for (const item of items) {
        // https://mp.data258.com/wx?id=${id}&t={token}, id is a permanent hex, token is a temporary base64
        const cacheId = item.link.match(/id=([\da-f]+)/)[1];
        item.link = item.link.startsWith('http') ? item.link : `${rootUrl}${item.link}`;
        const realLink = await ctx.cache.tryGet(`data258:${cacheId}`, async () => {
            try {
                // !!! here we must sleep 1s to avoid being anti-crawled !!!
                // !!! please do note that if the interval is less than 1s, your IP will be banned for a long time !!!
                await wait(1000);

                const response = await got.get(item.link, {
                    headers: {
                        Referer: pageUrl, // essential
                    },
                });
                if (response.data.includes('今日浏览次数已达上限')) {
                    // !!! as long as cache hits, the link will not be crawled and consume the limit !!!
                    // !!! so that's not a big problem if the RSSHub instance is self-hosted !!!
                    err = new got.RequestError(response.data, {}, response.request);
                    return null;
                }
                const $ = cheerio.load(response.data);
                const jmpJS = $('script')
                    .filter((_, e) => $(e).html().includes('location.href'))
                    .html();
                return jmpJS.match(/location\.href='([^']+)'/)[1];
            } catch (e) {
                err = e;
                return null;
            }
        });
        if (realLink) {
            item.link = realLink;
        } else {
            break; // being anti-crawled, immediately cancel following operations
        }
    }
    /* eslint-enable no-await-in-loop */

    // !!! release the lock, let it expire immediately since no need to keep it in cache !!!
    await ctx.cache.set('data258:lock', '0', 1);

    // jump links are valid only for a short period of time, drop those un-jumped items
    // http://mp.weixin.qq.com/s
    items = items.filter((item) => item.link.match(/^https?:\/\/mp\.weixin\.qq\.com\/s/));

    if (items.length === 0 && err) {
        // !!! if each request is anti-crawled, the filtered items array will be empty !!!
        // !!! let RSSHub throw an anti-crawler prompt !!!
        throw err;
    }

    await Promise.all(items.map(async (item) => await finishArticleItem(ctx, item, !!categoryPage)));

    ctx.state.data = {
        title,
        link: pageUrl,
        description,
        item: items,
    };
};

// TODO: login? the valid time for cookies seems to be short, and abusing account will probably get banned...
// TODO: fetch full article for the official RSS feed? unless someone who is VIP contributes their RSS feed for test...
