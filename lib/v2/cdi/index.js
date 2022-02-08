const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '152';

    const rootUrl = 'http://www.cdi.com.cn';
    const currentUrl = `${rootUrl}/Article/List?ColumnId=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.a-full')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: `${rootUrl}${item.attr('href')}`,
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

                item.title = content('h1').text();
                item.description = content('#info').html();
                item.pubDate = timezone(
                    parseDate(
                        content('.head p')
                            .text()
                            .match(/时间：(.*)/)[1]
                            .replace(/年|月/g, '-')
                    ),
                    +8
                );

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('h1').text()} - 国家高端智库/综合开发研究院`,
        link: currentUrl,
        item: items,
    };
};
