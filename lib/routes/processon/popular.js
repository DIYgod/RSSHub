const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const cate = ctx.params.cate || '';
    const sort = ctx.params.sort || '';

    const rootUrl = 'https://www.processon.com';
    const currentUrl = `${rootUrl}/popular/?cate=${cate}&sort=${sort}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('a.chart-title')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                description: `${item.parent().prev().html()}<p>${item.parent().find('p').text()}</p>`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.author = content('a.user_quickinfo').text();
                    item.pubDate = content('.chart-pubtime').text().split('发布于 ')[1];

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
