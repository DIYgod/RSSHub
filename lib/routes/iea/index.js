const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'news-and-events';

    const rootUrl = 'https://www.iea.org';
    const currentUrl = `${rootUrl}/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.m-news-listing__hover')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);

            const title = $(item).text();
            item = item.parent().get(0).tagName === 'a' ? $(item).parent() : $(item).parent().parent();

            return {
                title,
                link: `${rootUrl}${item.attr('href')}`,
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

                    item.description = content('.m-block__content').html();
                    item.pubDate = new Date(content('.o-hero-freepage__meta').text()).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').eq(0).text(),
        link: currentUrl,
        item: items,
    };
};
