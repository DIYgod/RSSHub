const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'index';

    const rootUrl = 'http://www.ccin.com.cn';
    const currentUrl = `${rootUrl}/c/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.news-bd')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('h2 a');

            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                pubDate: date(
                    item
                        .find('.news-tag')
                        .text()
                        .match(/(\d{4}-\d{2}-\d{2})/)[1]
                ),
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

                    item.description = content('.news-content-txt').html();

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
