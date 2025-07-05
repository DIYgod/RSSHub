import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/blog/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'https://surfshark.com';
    const currentUrl = new URL(`blog${category ? `/${category}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

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
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

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

    return {
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
}
