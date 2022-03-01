const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.rfi.fr';
    const currentUrl = `${rootUrl}/cn/滚动新闻`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.article__title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.parent().parent().attr('href')}`,
                pubDate: parseDate(item.prev().find('time').attr('datetime')),
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

                item.description = content('.t-content__body').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '滚动新闻 - 法国国际广播电台',
        link: currentUrl,
        item: items,
    };
};
