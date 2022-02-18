const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://getpolarized.io';
    const currentUrl = `${rootUrl}/blog`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h4 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: `${rootUrl}${item.attr('href')}`,
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

                item.title = content('h1').text();
                item.description = content('section').html();
                item.pubDate = new Date(detailResponse.data.match(/<!-- -->(\d{4}-\d{2}-\d{2})<\/h5><nav>/)[1]).toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Polar Blog',
        link: currentUrl,
        item: items,
    };
};
