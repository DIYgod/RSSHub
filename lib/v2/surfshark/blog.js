const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 15;

    const rootUrl = 'https://surfshark.com';
    const currentUrl = new URL(`blog${category ? `/${category}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.article-info')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.prop('title'),
                link: a.prop('href'),
                author: item.find('div.author, div.name').text().split('in')[0].trim(),
                category: item
                    .find('div.author, div.name')
                    .find('a')
                    .toArray()
                    .map((c) => $(c).text()),
                pubDate: parseDate(item.find('div.date, div.time').text().split('·')[0].trim(), 'YYYY, MMMM D'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('div.post-main-img').each(function () {
                    const image = content(this).find('img');

                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: image
                                    .prop('srcset')
                                    .match(/(https?:.*?\.\w+\s)/g)
                                    .pop()
                                    .trim(),
                                alt: image.prop('alt'),
                            },
                        })
                    );
                });

                item.title = content('div.blog-post-title').text();
                item.description = content('div.post-content').html();
                item.author = content('meta[name="author"]').prop('content');
                item.category = content('div.name')
                    .find('a')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = parseDate(content('meta[property="article:published_time"]').prop('content'));

                return item;
            })
        )
    );

    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="og:title"]').prop('content'),
        author: $('meta[property="og:site_name"]').prop('content'),
    };
};
