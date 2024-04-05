import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:category{.+}?',
    radar: [
        {
            source: ['asiantolick.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'asiantolick.com/',
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 24;

    const rootUrl = 'https://asiantolick.com';
    const apiUrl = new URL('ajax/buscar_posts.php', rootUrl).href;
    const currentUrl = new URL(category?.replace(/^(tag|category)?\/(\d+)/, '$1-$2') ?? '', rootUrl).href;

    const searchParams = {};
    const matches = category?.match(/^(tag|category|search|page)?[/-]?(\w+)/) ?? undefined;

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

    let $ = load(response);

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
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

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

    $ = load(currentResponse);

    const title = $('title').text().split(/-/)[0].trim();
    const icon = $('link[rel="icon"]').first().prop('href');

    return {
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
}
