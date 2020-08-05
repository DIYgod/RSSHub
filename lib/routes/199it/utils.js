const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx, keyword, currentUrl) => {
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('article.entry-list')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(item.find('time').attr('datetime')).toUTCString(),
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

                    item.description = content('div.entry-content').html();

                    return item;
                })
        )
    );

    return {
        title: '199IT - ' + keyword,
        link: currentUrl,
        item: items,
    };
};
