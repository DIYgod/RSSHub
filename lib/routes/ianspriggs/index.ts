import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import { isValidHost } from '@/utils/valid-host';

import { renderDescription } from './templates/description';

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

const parseYear = (value: string) => {
    const date = /^\d{4}$/.test(value) ? parseDate(`${value}-01-01`, 'YYYY-MM-DD', true) : undefined;
    return date && Number.isFinite(date.getTime()) ? new Date(Date.UTC(date.getFullYear(), 0, 1)) : undefined;
};

async function handler(ctx) {
    const { category = 'portraits' } = ctx.req.param();
    if (!isValidHost(category)) {
        throw new InvalidParameterError('Invalid category');
    }

    const limit = getRouteLimit(ctx, 30);

    const author = 'Ian Spriggs';
    const rootUrl = 'https://ianspriggs.com';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.work-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);

            const image = $item.find('img');

            return {
                title: $item.find('div.work-info').text(),
                link: $item.find('a').prop('href'),
                description: renderDescription({
                    images: image.prop('src')
                        ? [
                              {
                                  src: image.prop('src')!.replace(/_thumbnail\./, '.'),
                                  alt: image.prop('alt'),
                              },
                          ]
                        : undefined,
                }),
                author,
                pubDate: parseYear($item.find('div.work-info p').text()),
                enclosure_url: image.prop('src'),
                enclosure_type: image.prop('src') ? 'image/jpeg' : undefined,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const images = content('div.work-item img')
                    .toArray()
                    .map((item) => {
                        const $item = content(item);

                        return {
                            src: $item.prop('src')!.replace(/-\d+x\d+\./, '.'),
                            alt: $item.prop('alt'),
                        };
                    });

                item.title = content('div.project-title').text();
                item.description += renderDescription({
                    images,
                    description: content('div.nectar-fancy-ul').html() ?? undefined,
                });
                item.pubDate = parseYear(content('span.subheader').text());

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
        language: $('html').prop('lang') as Language,
        icon,
        logo: icon,
        subtitle: $('a[aria-current="page"] span.menu-title-text').text(),
        author,
    };
}
