const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    const category = ctx.params.category || '';

    const rootUrl = 'https://www.dx2025.com';
    const currentUrl = `${rootUrl}${type === '' ? '' : `/archives/${type === 'tag' ? `tag${category === '' ? '' : `/${category}`}` : `category/${type}${category === '' ? '' : `/${category}`}`}`}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.entry-title a')
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

                    item.author = content('.entry-author-name').text();
                    item.description = content('.bpp-post-content, .entry-content').html();
                    item.pubDate = new Date(content('.entry-date').attr('datetime')).toUTCString();

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
