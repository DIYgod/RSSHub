const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const asyncPool = require('tiny-async-pool');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const currentUrl = `https://news.cts.com.tw/${category}/index.html`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    const items = [];
    for await (const data of asyncPool(5, $('#newslist-top a[title]').slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20), (item) => {
        item = $(item);
        const link = item.attr('href');
        return ctx.cache.tryGet(link, async () => {
            const response = await got(link);
            const $ = cheerio.load(response.data);
            const author = $('.artical-content p:eq(0)').text().trim();
            $('.artical-content p:eq(0), .artical-content .flexbox').remove();

            return {
                title: item.attr('title'),
                author,
                description: $('.artical-content').html(),
                category: $('meta[property="article:section"]').attr('content'),
                pubDate: parseDate($('meta[property="article:published_time"]').attr('content')),
                link,
            };
        });
    })) {
        items.push(data);
    }

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').attr('content'),
        item: items,
    };
};
