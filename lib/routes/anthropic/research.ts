import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/research',
    categories: ['programming'],
    example: '/anthropic/research',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/research', 'www.anthropic.com'],
        },
    ],
    name: 'Research',
    maintainers: ['ttttmr', 'zlx'],
    handler,
    url: 'www.anthropic.com/research',
};

async function handler(ctx) {
    const baseUrl = 'https://www.anthropic.com';
    const link = `${baseUrl}/research`;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const response = await ofetch(link);
    const $ = load(response);

    const seen = new Set<string>();
    const list: DataItem[] = [];

    // Featured items and publication list items share the same link pattern
    $('a[href^="/research/"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href') ?? '';

        // Skip non-article links
        if (!href || href === '/research' || href.includes('/team/') || href.endsWith('#')) {
            return;
        }

        const fullLink = `${baseUrl}${href}`;
        if (seen.has(fullLink)) {
            return;
        }

        const title = $el.find('h2, h4, [class*="__title"]').first().text().trim();
        const dateText = $el.find('time').text().trim();
        const category = $el.find('span').first().text().trim();

        if (title) {
            seen.add(fullLink);
            list.push({
                title,
                link: fullLink,
                pubDate: dateText ? parseDate(dateText) : undefined,
                category: category ? [category] : [],
            });
        }
    });

    const items = await pMap(
        list.slice(0, limit),
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('article');
                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset');
                    const src = $e.attr('src');
                    if (src) {
                        const params = new URLSearchParams(src);
                        const newSrc = params.get('/_next/image?url');
                        if (newSrc) {
                            $e.attr('src', newSrc);
                        }
                    }
                });

                item.description = content.html() ?? undefined;

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic Research',
        link,
        description: 'Latest research from Anthropic',
        item: items,
    };
}
