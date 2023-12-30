const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 24;

    const rootUrl = 'https://asiantolick.com';
    const apiUrl = new URL('ajax/buscar_posts.php', rootUrl).href;
    const currentUrl = new URL(category?.replace(/^(tag|category)?\/(\d+)/, '$1-$2') ?? '', rootUrl).href;

    const searchParams = {};
    const matches = category?.match(/^(tag|category|search|page)?(?:-|\/)?(\w+)/) ?? undefined;

    if (matches) {
        const key = matches[1] === 'category' ? 'cat' : matches[1];
        const value = matches[2];
        searchParams[key] = value;
    } else if (category) {
        searchParams.page = 'news';
    }

    const { data: response } = await got(apiUrl, {
        searchParams,
    });

    let $ = cheerio.load(response);

    let items = $('a.miniatura')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const image = item.find('div.background_miniatura img');

            return {
                title: item.find('div.base_tt').text(),
                link: item.prop('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    images: image
                        ? [
                              {
                                  src: image.prop('data-src').split(/\?/)[0],
                                  alt: image.prop('alt'),
                              },
                          ]
                        : undefined,
                }),
                author: item.find('.author').text(),
                category: item
                    .find('.category')
                    .toArray()
                    .map((c) => $(c).text()),
                guid: image ? image.prop('post-id') : item.link.match(/\/(\d+)/)[1],
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('h1').first().text();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    description: content('#metadata_qrcode').html(),
                    images: content('div.miniatura')
                        .toArray()
                        .map((i) => ({
                            src: content(i).prop('data-src'),
                            alt: content(i).find('img').prop('alt'),
                        })),
                });
                item.author = content('.author').text();
                item.category = content('#categoria_tags_post a')
                    .toArray()
                    .map((c) => content(c).text().trim().replace(/^#/, ''));
                item.pubDate = parseDate(detailResponse.match(/"pubDate":\s"((?!http)[^"]*)"/)[1]);
                item.updated = parseDate(detailResponse.match(/"upDate":\s"((?!http)[^"]*)"/)[1]);
                item.enclosure_url = new URL(`ajax/download_post.php?ver=3&dir=/down/new_${item.guid}&post_id=${item.guid}&post_name=${detailResponse.match(/"title":\s"((?!http)[^"]*)"/)[1]}`, rootUrl).href;

                item.guid = `asiantolick-${item.guid}`;

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    $ = cheerio.load(currentResponse);

    const title = $('title').text().split(/-/)[0].trim();
    const icon = $('link[rel="icon"]').first().prop('href');

    ctx.state.data = {
        item: items,
        title: title === 'Asian To Lick' ? title : `Asian To Lick - ${title}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[name="msapplication-TileImage"]').prop('content'),
        icon,
        logo: icon,
        subtitle: title,
        allowEmpty: true,
    };
};
