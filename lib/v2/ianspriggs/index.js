const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category = 'portraits' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const author = 'Ian Spriggs';
    const rootUrl = 'https://ianspriggs.com';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.work-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const image = item.find('img').first();

            return {
                title: item.find('div.work-info').text(),
                link: item.find('a').prop('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    images: image?.prop('src')
                        ? [
                              {
                                  src: image.prop('src').replace(/_thumbnail\./, '.'),
                                  alt: image.prop('alt'),
                              },
                          ]
                        : undefined,
                }),
                author,
                pubDate: parseDate(item.find('div.work-info p').last(), 'YYYY'),
                enclosure_url: image?.prop('src') ?? undefined,
                enclosure_type: image?.prop('src') ? 'image/jpeg' : undefined,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                const images = content('div.work-item img')
                    .toArray()
                    .map((item) => {
                        item = content(item);

                        return {
                            src: item.prop('src').replace(/-\d+x\d+\./, '.'),
                            alt: item.prop('alt'),
                        };
                    });

                item.title = content('div.project-title').text();
                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    images,
                    description: content('div.nectar-fancy-ul').html(),
                });
                item.pubDate = parseDate(content('span.subheader').last().text(), 'YYYY');

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: $('a[aria-current="page"] span.menu-title-text').text(),
        author,
    };
};
