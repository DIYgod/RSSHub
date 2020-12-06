const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.onenotegem.com';
    const currentUrl = `${rootUrl}/a/release`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.paragraph ul li a')
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

                    const title = content('h1.wsite-content-title');

                    item.description = title.next().next().next().html();
                    item.pubDate = new Date(title.next().text()).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: 'OneNote Gem Addins Release History',
        link: currentUrl,
        item: items,
    };
};
