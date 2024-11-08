import { Route, DataItem } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/nielsberglund/blog',
    radar: [
        {
            source: ['nielsberglund.com/'],
        },
    ],
    url: 'nielsberglund.com/',
    name: 'Blog',
    maintainers: ['liyaozhong'],
    handler,
    description: 'Niels Berglund Blog Posts',
};

async function handler() {
    const rootUrl = 'https://nielsberglund.com';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);
    const $ = load(response.data);

    let items = $('.post-preview')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a').first();
            const href = $link.attr('href');
            const title = $item.find('.post-title').first().text().trim();
            const dateStr = $item.find('.post-meta').text().trim();

            if (!href || !title) {
                return null;
            }

            const link = new URL(href, rootUrl).href;
            const pubDate = parseDate(dateStr);

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

                        item.description = $detail('.post-container').html() || '';

                        return item;
                    } catch {
                        return item;
                    }
                })
            )
        )
    ).filter((item): item is DataItem => item !== null);

    return {
        title: 'Niels Berglund Blog',
        link: rootUrl,
        item: items,
    };
}
