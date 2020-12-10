const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const title = ctx.params.title || '';
    const category = ctx.params.category || 'all';

    const rootUrl = 'https://home.treasury.gov';
    const currentUrl = `${rootUrl}/news/press-releases${category === 'all' ? '' : `/${category}`}${title === '' ? '' : `?title=${title}`}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.featured-stories__headline a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
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

                    item.description = content('.field--name-field-news-body').html();
                    item.pubDate = new Date(content('time').attr('datetime')).toUTCString();

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
