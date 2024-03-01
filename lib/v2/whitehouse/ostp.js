const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.whitehouse.gov';
    const currentUrl = `${rootUrl}/ostp/news-updates`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.news-item__title')
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
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.body-content').html();
                item.pubDate = parseDate(content('time.published').attr('datetime'));
                item.author = content('span.tax-links.cat-links > a').text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Whitehouse OSTP',
        link: currentUrl,
        description: 'Whitehouse Office of Science and Technology Policy',
        item: items,
    };
};
