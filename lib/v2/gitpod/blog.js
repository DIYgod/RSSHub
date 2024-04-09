const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { rootUrl } = require('./utils');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
    const response = await got(rootUrl + '/blog');
    const $ = cheerio.load(response.data);
    let items = $('div[class^="flex justify-center"]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h2').text(),
                link: rootUrl + item.find('a').attr('href'),
                pubDate: parseDate(item.find('span[class^=date]').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                const headerImg = content('img[class^=max-h]');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    img: headerImg.attr('src'),
                    alt: headerImg.attr('alt'),
                    content: content('div[class^=content-blog]').html(),
                });
                item.author = content('span.avatars a')
                    .toArray()
                    .map((e) => content(e).text().trim())
                    .join(', ');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl + '/blog',
        description: $('meta[name="description"]').attr('content'),
        language: 'en-US',
        item: items,
    };

    ctx.state.json = {
        title: $('title').text(),
        link: rootUrl + '/blog',
        description: $('meta[name="description"]').attr('content'),
        language: 'en-US',
        item: items,
    };
};
