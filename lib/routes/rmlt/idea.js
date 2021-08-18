const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'http://www.rmlt.com.cn';
    const currentUrl = `${rootUrl}/idea/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $(category ? '.txt-list' : '.hot-news')
        .find('a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);

            return {
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.title = content('.article-title').text();
                item.description = content('.article-content').html();
                item.pubDate = timezone(parseDate(content('.date').text(), 'YYYY-MM-DD HH:ss'), +8);

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
