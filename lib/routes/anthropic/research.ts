import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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
    maintainers: ['ttttmr'],
    handler,
    url: 'www.anthropic.com/research',
};

async function handler(ctx) {
    const link = 'https://www.anthropic.com/research';
    const response = await ofetch(link);
    const $ = load(response);
    const limit = getRouteLimit(ctx, 20);

    const posts = $('article[data-listing-row]')
        .toArray()
        .slice(0, limit)
        .map((element): DataItem => {
            const $e = $(element);
            const $link = $e.find('a[class$="_metaTitleLink"]');
            const href = $link.attr('href') ?? '';
            const dateText = $e.find('time').text();
            return {
                title: $link.text().trim(),
                link: href.startsWith('http') ? href : `https://www.anthropic.com${href}`,
                pubDate: dateText ? parseDate(dateText, 'MMM D, YYYY') : undefined,
            };
        });

    const items = await pMap(
        posts,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('#main-content > div > article');
                content.find('[class$="_Header"], [class$="_ConstellationPanelSlot"]').remove();
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

                item.description = content.html();

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
