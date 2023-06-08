const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'tzgg';

    const rootUrl = 'https://yjsy.sdust.edu.cn';
    const currentUrl = `${rootUrl}/zhaosheng/${id}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.pageUl ul li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                link: new URL(item.attr('href'), currentUrl).href,
                pubDate: parseDate(item.find('span').text()),
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

                item.description = content('.txt, .v_news_content').html();

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
