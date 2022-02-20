const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'test';
    const language = ctx.params.language ?? 'tc';
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://www.consumer.org.hk';
    const currentUrl = `${rootUrl}/${language}/free-article/free-article-${category}?category=free-article-${category}&q=${keyword}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.half-img-blk__title, .img-plate-blk__title')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.parent().prev().find('li').first().text(), 'YYYY.MM'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.ckec').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
