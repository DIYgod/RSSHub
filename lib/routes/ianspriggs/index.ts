import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:category?',
    categories: ['blog'],
    example: '/ianspriggs/portraits',
    parameters: { category: 'Category, see below, 3D PORTRAITS by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    description: `| 3D PORTRAITS | CHARACTERS |
| ------------ | ---------- |
| portraits    | characters |`,
};

async function handler(ctx) {
    const { category = 'portraits' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const author = 'Ian Spriggs';
    const rootUrl = 'https://ianspriggs.com';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

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
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

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

    return {
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
}
