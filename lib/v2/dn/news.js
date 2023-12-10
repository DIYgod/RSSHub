const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { language, category = '' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;

    const rootUrl = 'https://dn.com';
    const currentUrl = new URL(`/${language}/news/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('a.list-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const image = item.find('div.img img');

            return {
                title: item.find('h2.ellipse2').text(),
                link: new URL(item.prop('href'), rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: image
                        ? {
                              src: image.prop('src'),
                              alt: image.prop('alt'),
                          }
                        : undefined,
                    abstracts: item.find('p.abstract').html(),
                }),
                category: item
                    .find('span.cat')
                    .toArray()
                    .map((c) => $(c).text()),
                pubDate: timezone(parseDate(item.find('span.time').text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('h1.tit').text();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    abstracts: content('div.abstract').html(),
                    description: content('div.detail').html(),
                });
                item.author = content('span.author')
                    .text()
                    .replace(/(By|作者)\s/, '');
                item.category = [
                    ...item.category,
                    ...content('div.tags p a')
                        .toArray()
                        .map((c) => content(c).text()),
                ];
                item.pubDate = timezone(parseDate(content('span.date').text()), +8);

                return item;
            })
        )
    );

    const title = $('a.logo img').prop('alt');
    const icon = $('link[rel="icon"]').prop('href');

    ctx.state.data = {
        item: items,
        title: `${title} - ${$('div.group a.active').text()}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image: new URL($('a.logo img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('title').text(),
        author: title,
    };
};
