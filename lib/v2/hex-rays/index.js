const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://www.hex-rays.com/blog/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('.post-list-container')
        .map((_, ele) => ({
            title: $('h3 > a', ele).text(),
            link: $('h3 > a', ele).attr('href'),
            pubDate: parseDate($('.post-meta:nth-of-type(1)', ele).first().text().trim().replace('Posted on:', '')),
            author: $('.post-meta:nth-of-type(2)', ele).first().text().replace('By:', '').trim(),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = cheerio.load(detailResponse.data);

                item.category = (
                    content('.category-link')
                        .toArray()
                        .map((e) => $(e).text()) +
                    ',' +
                    content('.tag-link')
                        .toArray()
                        .map((e) => $(e).text())
                ).split(',');

                item.description = content('.post-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Hex-Rays Blog',
        link,
        item: items,
    };
};
