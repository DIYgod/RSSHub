const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id || 'news';
    const order = ctx.params.order || 'obdate';

    const rootUrl = 'https://www.psnine.com';
    const currentUrl = `${rootUrl}/node/${id}?ob=${order}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.psnnode, .node').remove();

    const list = $('.title a')
        .map((_, item) => {
            item = $(item);
            const date = item.parent().next().text().trim();

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: new Date(date.length === 11 ? `${new Date().getFullYear()}-${date}` : date).toUTCString(),
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

                    item.author = content('a[itemprop="author"]').eq(0).text();
                    item.description = content('div[itemprop="articleBody"]').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()} - PSN中文站`,
        link: currentUrl,
        item: items,
    };
};
