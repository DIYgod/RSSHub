const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.partnershiponai.org';
    const currentUrl = `${rootUrl}/resources`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('a.grid-box')
        .map((_, item) => {
            item = $(item);

            return {
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

                item.title = content('title').text().replace(' - The Partnership on AI', '');
                item.description = content('.resource-detail-content, .case-study-body').html();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(.*)","dateModified":/)[1]);

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
