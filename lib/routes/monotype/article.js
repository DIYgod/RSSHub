const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.monotype.com/resources';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('h3.component-title')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: url.resolve(rootUrl, item.find('a').attr('href')),
            };
        })
        .get();

    ctx.state.data = {
        title: 'Monotype - Feature Articles',
        link: rootUrl,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.pubDate = new Date(content('meta[itemprop="acquia_lift:published_date"]').attr('content') * 1000).toUTCString();
                    item.description = content('div.left-region').html();
                    return item;
                })
            )
        ),
    };
};
