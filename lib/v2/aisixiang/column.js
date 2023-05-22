const got = require('@/utils/got');
const cheerio = require('cheerio');
const { rootUrl, ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;

    const currentUrl = `${rootUrl}/data/search?column=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const title = $('div.article-title a').first().text().replace(/\[|\]/g, '');

    const items = $('div.search_list a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text().split('：').pop(),
                link: new URL(item.attr('href'), rootUrl).href,
            };
        });

    ctx.state.data = {
        title: `爱思想 - ${title}`,
        link: currentUrl,
        item: await ProcessFeed(limit, ctx.cache.tryGet, items),
    };
};
