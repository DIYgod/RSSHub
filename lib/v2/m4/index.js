const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id = 'news', category = 'china' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = `http://${id}.m4.cn`;
    const currentUrl = new URL(category ? `/${category.replace(/\/$/, '')}/` : '/', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.articleitem0 div.aheader0')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                title: a.text(),
                link: a.prop('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    images: [
                        {
                            src: item.parent().find('div.aimg0 a img').prop('src'),
                            alt: a.text(),
                        },
                    ],
                }),
                category: item
                    .find('a.aclass')
                    .toArray()
                    .map((c) => $(c).text().replaceAll('[]', '').trim()),
                pubDate: timezone(parseDate(item.find('span.atime').text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('h1').first().text();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    intro: content('div.aintro1, p.cont-summary').text(),
                    description: content('div.content0, div.cont-detail').html(),
                });
                item.category = content('span.dd0 a, a[rel="category"]')
                    .toArray()
                    .map((c) => content(c).text())
                    .slice(1);
                item.pubDate = timezone(parseDate(content('span.atime1, span.post-time').text()), +8);

                return item;
            })
        )
    );

    const image = $('a.logo0_b img').prop('src');

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: $('meta[name="author"]').prop('content'),
        allowEmpty: true,
    };
};
