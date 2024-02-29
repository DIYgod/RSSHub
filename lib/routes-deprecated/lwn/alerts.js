const url = require('url');
const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const distributor = ctx.params.distributor;
    const listUrl = `https://lwn.net/Alerts/${distributor}/`;
    const res = await got({
        method: 'get',
        url: listUrl,
    });
    const $ = cheerio.load(res.data);
    const title = $('.PageHeadline').text();
    const list = $('.ArticleText').find('table tbody tr:not(:first-of-type)');
    const count = [];
    for (let i = 0; i < list.length; i++) {
        count.push(i);
    }
    const resultItem = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const originalUrl = each.find('td > a').attr('href');
            const link = url.resolve('https://lwn.net', originalUrl);
            const pubDate = parseRelativeDate(each.find('td:nth-of-type(3)').text());

            const cacheKey = `LWN.net:${link}`;
            const cacheValue = await ctx.cache.get(cacheKey);

            let item;
            if (cacheValue) {
                item = JSON.parse(cacheValue);
            } else {
                const detail = await got({
                    method: 'get',
                    url: link,
                });
                const content = cheerio.load(detail.data);
                item = {
                    title: content('.PageHeadline').text(),
                    description: content('.ArticleText').html(),
                    link,
                    pubDate,
                };
                ctx.cache.set(cacheKey, JSON.stringify(item));
            }

            return item;
        })
    );

    ctx.state.data = {
        title,
        link: listUrl,
        item: resultItem,
    };
};
