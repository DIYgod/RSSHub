import { load } from 'cheerio';
import dayjs from 'dayjs';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:name',
    categories: ['picture'],
    example: '/gocomics/foxtrot',
    parameters: { name: 'URL path of the strip on gocomics.com' },
    radar: [
        {
            source: ['www.gocomics.com/:name'],
        },
    ],
    name: 'Comic Strips',
    maintainers: ['stjohnjohnson'],
    handler,
    url: 'www.gocomics.com',
};

async function handler(ctx: Context) {
    const baseUrl = 'https://www.gocomics.com';
    const { name } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? 5);
    const url = `${baseUrl}/${name}`;

    const response = await ofetch(url);
    const $ = load(response);
    const ldJson = $('script[type="application/ld+json"]')
        .toArray()
        .map((el) => JSON.parse($(el).text()));

    const series = ldJson.find((data) => data['@type'] === 'ComicSeries');
    const strip = ldJson.find((data) => data['@type'] === 'ImageObject' && data.contentUrl && data.datePublished);
    if (!strip) {
        throw new Error(`Comic Not Found - ${name}`);
    }

    const author = strip.author?.name;
    const items: DataItem[] = [
        {
            title: strip.name,
            author,
            category: ['comic'],
            description: `<img src="${strip.contentUrl}" />`,
            pubDate: parseDate(strip.datePublished),
            link: `${baseUrl}/${name}/${dayjs(strip.datePublished).format('YYYY/MM/DD')}`,
        } as DataItem,
    ];

    const previousSelector = '[data-testid="main-comic-viewer"] a[class*="controls__button_previous"]';
    let previous = $(previousSelector).attr('href');

    while (items.length < limit && previous) {
        const link = `${baseUrl}${previous}`;
        // oxlint-disable-next-line no-await-in-loop
        const page = (await cache.tryGet(link, async () => {
            const detailResponse = await ofetch(link);
            const $ = load(detailResponse);

            return {
                item: {
                    title: $('meta[property="og:title"]').attr('content')?.replace(' | GoComics', ''),
                    author,
                    category: ['comic'],
                    description: `<img src="${$('meta[property="og:image"]').attr('content')}" />`,
                    pubDate: parseDate(link.split('/').slice(-3).join('/')),
                    link,
                } as DataItem,
                previous: $(previousSelector).attr('href'),
            };
        })) as { item: DataItem; previous?: string };
        items.push(page.item);
        previous = page.previous;
    }

    return {
        title: `${series?.name ?? name} - GoComics`,
        description: series?.description,
        link: url,
        item: items,
    };
}
