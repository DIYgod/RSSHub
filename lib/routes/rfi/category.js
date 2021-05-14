const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://www.rfi.fr';
    const currentUrl = `${rootUrl}/cn/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.article__title')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.parent().parent().attr('href')}`,
                pubDate: Date.parse(item.prev().find('time').attr('datetime')),
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

                    item.description = content('.t-content__body').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${category ? $('.o-pb-masterhead__title').text() : 'Home'} - rfi`,
        link: currentUrl,
        item: items,
    };
};
