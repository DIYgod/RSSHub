const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const asyncPool = require('tiny-async-pool');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category = 'en' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 22;

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL(`blog/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    const items = $('article[id]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('div.title').text();

            return {
                title,
                link: item.find('a.articles-grid-link').prop('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: item
                            .find('div.articles-grid-img img')
                            .prop('src')
                            .replace(/-\d+x\d+\./, '.'),
                        alt: title,
                    },
                }),
                category: item
                    .find('a.section')
                    .toArray()
                    .map((c) => $(c).text()),
                guid: `tradingview-blog-${category}-${item.prop('id')}`,
                pubDate: parseDate(item.find('div.date').text(), 'MMM D, YYYY'),
            };
        });

    for await (const item of asyncPool(3, items, (item) =>
        ctx.cache.tryGet(item.link, async () => {
            const { data: detailResponse } = await got(item.link);

            const content = cheerio.load(detailResponse);

            content('div.entry-content')
                .find('img')
                .each((_, e) => {
                    content(e).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: content(e)
                                    .prop('src')
                                    .replace(/-\d+x\d+\./, '.'),
                                width: content(e).prop('width'),
                                height: content(e).prop('height'),
                            },
                        })
                    );
                });

            item.title = content('meta[property="og:title"]').prop('content');
            item.description = art(path.join(__dirname, 'templates/description.art'), {
                image: {
                    src: content('meta[property="og:image"]').prop('content'),
                    alt: item.title,
                },
                description: content('div.entry-content').html(),
            });
            item.author = content('meta[property="og:site_name"]').prop('content');
            item.category = content('div.sections a.section')
                .toArray()
                .map((c) => content(c).text());
            item.pubDate = parseDate(content('div.single-date').text(), 'MMM D, YYYY');

            return item;
        })
    )) {
        items.shift();
        items.push(item);
    }

    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('div.site-subtitle').text(),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: $('h1.site-title').text(),
    };
};
