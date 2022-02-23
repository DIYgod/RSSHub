const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const currentUrl = `${rootUrl}/album/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const category = $('span[data-type="tags"]')
        .first()
        .find('a')
        .toArray()
        .map((c) => $(c).text());
    const author = $('span[data-type="author"]')
        .first()
        .find('a')
        .toArray()
        .map((a) => $(a).text())
        .join(', ');

    let items = $('.btn-toolbar')
        .first()
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.hidden-xs').text()),
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

                content('.tab-content').remove();

                item.author = author;
                item.category = category;
                item.description = `<img src="${content('.thumb-overlay-albums img[data-original]')
                    .toArray()
                    .map((image) => content(image).attr('data-original'))
                    .join('"><img src="')}">`;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
    };
};
