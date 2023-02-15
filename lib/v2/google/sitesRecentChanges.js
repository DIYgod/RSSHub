const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://sites.google.com';
    const currentUrl = `${rootUrl}/site/${id}/activity.xml`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('entry')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('summary').text(),
                link: item.find('summary a').attr('href'),
                pubDate: parseDate(item.find('updated').text()),
                author: item.find('author name').text(),
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

                item.description = content('#sites-canvas').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('feed title').first().text(),
        link: currentUrl,
        item: items,
    };
};
