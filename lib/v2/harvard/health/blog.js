const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.health.harvard.edu';
    const currentUrl = `${rootUrl}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.lg\\:text-2xl')
        .toArray()
        .map((item) => {
            item = $(item).parent();

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                const ldJson = JSON.parse(content('script[type="application/ld+json"]').text())['@graph'].find((i) => i['@type'] === 'Article');

                item.description = content('.content-repository-content').html();
                item.pubDate = parseDate(ldJson.datePublished);
                item.author = ldJson.author.name;

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
