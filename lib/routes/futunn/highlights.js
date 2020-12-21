const got = require('@/utils/got');
const cheerio = require('cheerio');
const date_util = require('@/utils/date');

module.exports = async (ctx) => {
    const link = `https://news.futunn.com/main`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    // extract json from 'window._params = {...};'
    const params = $('script:not([src])').html().trim().slice(17, -1);

    const newslist = JSON.parse(params).preList;

    const out = await Promise.all(
        newslist.map(async (info) => {
            const title = info.title;
            const itemUrl = info.url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                url: itemUrl,
                method: 'get',
                headers: {
                    Referer: link,
                },
            });

            const $ = cheerio.load(response.data);

            const description = $('div.newsDetailBox div.main div.inner').html() || '原文已被删除';

            const date = $('div.timeBar').text();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: date_util(date, 8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    const outfilter = out.filter((t) => t.description !== '原文已被删除');

    ctx.state.data = {
        title: `富途牛牛要闻`,
        link: link,
        item: outfilter,
    };
};
