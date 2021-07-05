const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.yxdown.com';
    const currentUrl = `${rootUrl}/news`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('ul li a b')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.parent().attr('href'),
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

                    item.pubDate = new Date(content('.intro span').eq(0).text() + ' GMT+8').toUTCString();

                    content('h1, .intro').remove();

                    item.description = content('.news').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '精彩推荐 - 游讯网',
        link: currentUrl,
        item: items,
    };
};
