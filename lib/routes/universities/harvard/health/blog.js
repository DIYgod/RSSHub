const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.health.harvard.edu';
    const currentUrl = `${rootUrl}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.text-2xl')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item).parent();

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                const date = item.link.substr(item.link.length - 12, 8);

                item.description = content('.content-repository-content').html();
                item.pubDate = Date.parse(`${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Harvard Health Blog',
        link: currentUrl,
        item: items,
    };
};
