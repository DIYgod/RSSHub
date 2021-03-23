const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const rootUrl = 'https://database.caixin.com';
    const currentUrl = `${rootUrl}/news`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h4 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
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

                    item.pubDate = date(content('#pubtime_baidu').text());
                    item.description = `<p>${content('#subhead').html()}</p>`;

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '财新数据通 - 专享资讯',
        link: currentUrl,
        item: items,
    };
};
