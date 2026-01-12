import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/red',
    categories: ['programming'],
    example: '/anthropic/red',
    radar: [
        {
            source: ['red.anthropic.com'],
        },
    ],
    name: 'Frontier Red Team',
    maintainers: ['shoeper'],
    handler,
    url: 'red.anthropic.com',
};

async function handler() {
    const baseUrl = 'https://red.anthropic.com';
    const link = `${baseUrl}/red`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('a[class^="note"]')
        .toArray()
        .map((element) => {
            const $e = $(element);
            return {
                title: $e.find('h2, h3').text().trim(),
                link: `${baseUrl}/${$e.attr('href')}`,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.pubDate = parseDate($('d-article p').first().text().trim());
                $('h3:contains("Subscribe")').remove();
                $('d-article p').first().remove();
                const content = $('d-article');
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
        title: 'Anthropic Frontier Red Team',
        link,
        image: `${baseUrl}/anthropic-serve/favicon.ico`,
        item: items,
    };
}
