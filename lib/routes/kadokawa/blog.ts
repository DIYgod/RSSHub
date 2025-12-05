import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://www.kadokawa.com.tw';
    const currentUrl = new URL('blog/posts', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.List-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const image = item.find('div.List-item-excerpt img').prop('src')?.split(/\?/)[0] ?? undefined;
            const title = item.find('h2.List-item-title').text();
            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: item.find('div.List-item-preview').text(),
            });

            return {
                title,
                description,
                pubDate: parseDate(item.find('span.primary-border-color-after').text()),
                link: new URL(item.find('a').prop('href'), rootUrl).href,
                content: {
                    html: description,
                    text: item.find('div.List-item-preview').text(),
                },
                image,
                banner: image,
                language,
                enclosure_url: image,
                enclosure_type: image ? `image/${image.split(/\./).pop()}` : undefined,
                enclosure_title: title,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.Post-title').text().trim();
                const description = art(path.join(__dirname, 'templates/description.art'), {
                    description: $$('div.Post-content').html(),
                });
                const image = $$('meta[property="og:image"]').prop('content')?.split(/\?/)[0] ?? undefined;

                item.title = title;
                item.description = description;
                item.pubDate = parseDate($$('div.Post-date').text().trim());
                item.content = {
                    html: description,
                    text: $$('div.Post-content').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;
                item.enclosure_url = image;
                item.enclosure_type = image ? `image/${image.split(/\./).pop()}` : undefined;
                item.enclosure_title = title;

                return item;
            })
        )
    );

    const image = new URL($('meta[property="og:image"]').prop('content'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/blog',
    name: '角編新聞台',
    url: 'kadokawa.com.tw',
    maintainers: ['nczitzk'],
    handler,
    example: '/kadokawa/blog',
    parameters: undefined,
    description: '',
    categories: ['blog'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['kadokawa.com.tw/blog/posts'],
            target: '/blog',
        },
    ],
};
