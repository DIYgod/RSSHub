const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;

    const rootUrl = 'https://cbaigui.com';
    const currentUrl = new URL(ctx.path.replace(/^\/cbaigui/, ''), rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('article')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h2.post-title a').text(),
                link: new URL(`${item.prop('id')}.html`, rootUrl).href,
                description: item.find('div.entry').html(),
                pubDate: timezone(parseDate(`${item.find('div.post-date-year').text()}${item.find('div.post-date-month').text()}${item.find('div.post-date-day').text().trim()}`, 'YYYYM月DD'), +8),
                comments: item.find('a.post-comments').text() ? parseInt(item.find('a.post-comments').text(), 10) : 0,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('div.wbp-cbm').remove();
                content('div.clear').remove();

                const upvoteMatches = content('span.like-count')
                    .text()
                    .match(/赞\((\d+)\)/);

                const categories = content('div.page-title a')
                    .toArray()
                    .map((c) => content(c).text());

                // To handle lazy-loaded images from external sites.

                content('figure').each(function () {
                    const image = content(this).find('img');
                    const src = image.prop('data-actualsrc') ?? image.prop('data-original');
                    const width = image.prop('data-rawwidth');
                    const height = image.prop('data-rawheight');

                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/figure.art'), {
                            src,
                            width,
                            height,
                        })
                    );
                });

                // To remove watermarks on images.

                content('p img').each(function () {
                    const image = content(this);
                    const src = image.prop('src').split('!')[0];
                    const width = image.prop('width');
                    const height = image.prop('height');

                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/figure.art'), {
                            src,
                            width,
                            height,
                        })
                    );
                });

                item.description = content('div.entry').html();
                item.author = categories.join('/');
                item.category = [
                    ...content('p.post-tags a[rel="tag"]')
                        .toArray()
                        .map((c) => content(c).text()),
                    ...categories,
                ];
                item.pubDate = parseDate(content('div.post-time').text());
                item.upvotes = upvoteMatches ? parseInt(upvoteMatches[1], 10) : 0;
                item.comments = content('a[href="#commentlist-container"] span').text() ? parseInt(content('a[href="#commentlist-container"] span').text(), 10) : 0;

                return item;
            })
        )
    );

    const icon = $('link[rel="apple-touch-icon"]').first().prop('href');

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: $('meta[name="msapplication-TileImage"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('p.site-description').text(),
        author: $('p.site-title').text(),
    };
};
