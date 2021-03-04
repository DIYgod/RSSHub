const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx, currentUrl) => {
    const rootUrl = `https://mind42.com`;
    currentUrl = `${rootUrl}/${currentUrl}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('.title a.title')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
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

                    item.title = content('h1 a[name="info"]').text();
                    item.author = content('.creator').text().trim().replace('by', '');
                    item.description = `<img src="/api/ajax/mindmapThumbnail?mindmapId=${item.link.split('/public/')[1]}&amp;size=gallery"><p>${content('.description').text()}</p>`;

                    return item;
                })
        )
    );

    return {
        title: $('title').text().split(' - ')[0],
        link: currentUrl,
        item: items,
    };
};
