const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';
    const keyword = ctx.params.keyword ?? '';

    const urls = {
        '': '',
        category: `/category-${keyword}`,
        tag: `/tag-${keyword}`,
        search: `/search/${keyword}`,
    };

    const rootUrl = 'https://asiantolick.com';
    const currentUrl = `${rootUrl}${urls[category]}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.miniatura')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.attr('href'),
                title: item.find('.titulo_video').text(),
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

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    images: content('.gallery_img')
                        .toArray()
                        .map((i) => content(i).attr('data-src')),
                });

                item.pubDate = parseDate(detailResponse.data.match(/"pubDate": "(.*)",/)[1]);

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
