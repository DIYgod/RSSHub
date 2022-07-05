const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.fda.gov';
    const currentUrl = `${rootUrl}/medical-devices/news-events-medical-devices/cdrhnew-news-and-updates`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('div[role="main"] a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: /^http/.test(link) ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.author = content('meta[property="article:publisher"]').attr('content');

                try {
                    item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content').split(', ').pop(), 'MM/DD/YYYY - HH:mm');
                } catch (e) {
                    item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));
                }

                item.description = content('div[role="main"], .doc-content-area').html();

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
