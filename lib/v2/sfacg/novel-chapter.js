const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = Number.parseInt(ctx.query.limit) || 20;

    const baseUrl = 'https://book.sfacg.com';

    const { data: response } = await got(`${baseUrl}/Novel/${id}/MainIndex/`);
    const $ = cheerio.load(response);

    const title = $('h1.story-title').text();
    const list = $('div.catalog-list ul li a')
        .slice(-limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: `${baseUrl}${item.attr('href')}`,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('div.article-content').html();

                const rawDate = $('div.article-desc span').eq(1).text();
                item.pubDate = timezone(parseDate(rawDate.replace('更新时间：', '')), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `SF轻小说 ${title}`,
        link: `${baseUrl}/Novel/${id}`,
        item: items,
    };
};
