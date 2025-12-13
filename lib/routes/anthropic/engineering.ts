import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/engineering',
    categories: ['programming'],
    example: '/anthropic/engineering',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/engineering', 'www.anthropic.com'],
        },
    ],
    name: 'Engineering',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.anthropic.com/engineering',
};

async function handler(ctx) {
    const baseUrl = 'https://www.anthropic.com';
    const link = `${baseUrl}/engineering`;
    const response = await ofetch(link);
    const $ = load(response);
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const list: DataItem[] = $('a[class*="cardLink"]')
        .toArray()
        .map((element) => {
            const $e = $(element);
            const href = $e.attr('href') ?? '';
            const fullLink = href.startsWith('http') ? href : `${baseUrl}${href}`;
            const pubDate = $e.find('div[class*="date"]').text().trim();
            return {
                title: $e.find('h2, h3').text().trim(),
                link: fullLink,
                pubDate,
            };
        })
        .filter((item) => item.title && item.link)
        .slice(0, limit);

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('article > div > div[class*="__body"]');

                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset');
                    const src = $e.attr('src');
                    const params = new URLSearchParams(src);
                    const newSrc = params.get('/_next/image?url');
                    if (newSrc) {
                        $e.attr('src', newSrc);
                    }
                });

                item.description = content.html() ?? undefined;

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic Engineering',
        link,
        description: 'Latest engineering posts from Anthropic',
        image: `${baseUrl}/images/icons/apple-touch-icon.png`,
        item: items,
    };
}
