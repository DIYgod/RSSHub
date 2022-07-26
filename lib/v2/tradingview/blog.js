const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const asyncPool = require('tiny-async-pool');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'en';

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = `${rootUrl}/blog/${language}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.articles-grid-item a[rel="bookmark"]')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title').text(),
                link: item.attr('href'),
                pubDate: parseDate(item.find('.date').text(), 'MMMM D, YYYY'),
            };
        });

    const items = [];
    for await (const item of asyncPool(3, list, (item) =>
        ctx.cache.tryGet(item.link, async () => {
            const detailResponse = await got({
                method: 'get',
                url: item.link,
            });

            const content = cheerio.load(detailResponse.data);

            item.description = art(path.join(__dirname, 'templates/description.art'), {
                image: content('.single-img img').attr('src'),
                description: content('.entry-content').html(),
            });

            return item;
        })
    )) {
        items.push(item);
    }

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
