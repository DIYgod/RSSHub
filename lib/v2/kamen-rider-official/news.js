const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 50;

    const rootUrl = 'https://www.kamen-rider-official.com';
    const apiUrl = new URL('api/v1/news_articles', rootUrl).href;
    const currentUrl = new URL(`news_articles/${category ? `?category=${category}` : ''}`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const buildId = currentResponse.match(/"buildId":"(\w+)"/)[1];

    const apiCategoryUrl = new URL(`_next/data/${buildId}/news_articles.json`, rootUrl).href;

    const { data: categoryResponse } = await got(apiCategoryUrl);

    const id = categoryResponse.pageProps.categoryIds[category];

    const { data: response } = await got(apiUrl, {
        searchParams: {
            category_id: id,
            limit,
            offset: 0,
        },
    });

    let items = response.news_articles.slice(0, limit).map((item) => ({
        title: item.list_title,
        link: new URL(item.path, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: item.list_image_path
                ? {
                      src: new URL(item.list_image_path, rootUrl).href,
                      alt: item.list_title,
                  }
                : undefined,
        }),
        author: item.author,
        category: [item.category_name, item.category_2_name].filter((c) => c),
        guid: `kamen-rider-official-${item.id}`,
        pubDate: parseDate(item.release_date),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('a.c-button').each(function () {
                    content(this).parent().remove();
                });

                content('img').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: content(this).prop('src'),
                            },
                        })
                    );
                });

                item.title = content('h1.p-post__title').text() || item.title;
                item.description = content('main.p-post__main').html();
                item.author = content('div.p-post__responsibility p')
                    .toArray()
                    .map((a) => content(a).text())
                    .join(' / ');
                item.category = Array.from(
                    new Set(
                        [
                            ...item.category,
                            ...content('ul.p-post__categories li a.p-post__category')
                                .toArray()
                                .map((c) => content(c).text().trim()),
                        ].filter((c) => c)
                    )
                );

                return item;
            })
        )
    );

    const $ = cheerio.load(currentResponse);

    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${$('title').text().split(/ー/)[0]}${category ? ` - ${category}` : ''}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="keywords"]').prop('content'),
        author: $('meta[property="og:site_name"]').prop('content'),
        allowEmpty: true,
    };
};
