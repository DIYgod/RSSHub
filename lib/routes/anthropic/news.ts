import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/anthropic/news',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/news', 'www.anthropic.com'],
        },
    ],
    name: 'News',
    maintainers: ['etShaw-zh', 'goestav'],
    handler,
    url: 'www.anthropic.com/news',
};

async function handler(ctx) {
    const link = 'https://www.anthropic.com/news';
    const response = await ofetch(link);
    const $ = load(response);
    const limit = getRouteLimit(ctx, 10);

    const list: DataItem[] = $('[data-listing-row]')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            const $link = $el.find('a[class$="_title-link"]');
            const title = $link.text().trim();
            const href = $link.attr('href') ?? '';
            const pubDate = $el.find('time').text().trim();
            const link = href.startsWith('http') ? href : `https://www.anthropic.com${href}`;
            return {
                title,
                link,
                pubDate,
            };
        });

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('#main-content');

                $('[class$="_Header"], [class$="_ConstellationPanelSlot"]').remove();

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
        title: 'Anthropic News',
        link,
        description: 'Latest news from Anthropic',
        item: out,
    };
}
