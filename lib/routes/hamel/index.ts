import { Route, DataItem } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/hamel/blog',
    radar: [
        {
            source: ['hamel.dev/'],
        },
    ],
    url: 'hamel.dev/',
    name: 'Blog',
    maintainers: ['liyaozhong'],
    handler,
    description: "Hamel's Blog Posts",
};

async function handler() {
    const rootUrl = 'https://hamel.dev';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);
    const $ = load(response.data);

    let items = $('tr[data-index]')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('td a').last();
            const $date = $item.find('.listing-date');

            const href = $link.attr('href');
            const title = $link.text().trim();
            const dateStr = $date.text().trim();

            if (!href || !title || !dateStr) {
                return null;
            }

            const link = new URL(href, rootUrl).href;
            const pubDate = parseDate(dateStr, 'M/D/YY');

            return {
                title,
                link,
                pubDate,
            } as DataItem;
        })
        .filter((item): item is DataItem => item !== null);

    items = (
        await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link as string, async () => {
                    try {
                        const detailResponse = await got(item.link);
                        const $detail = load(detailResponse.data);

                        return {
                            ...item,
                            description: $detail('.content').html() || '',
                        } as DataItem;
                    } catch {
                        return item;
                    }
                })
            )
        )
    ).filter((item): item is DataItem => item !== null);

    return {
        title: "Hamel's Blog",
        link: rootUrl,
        item: items,
    };
}
