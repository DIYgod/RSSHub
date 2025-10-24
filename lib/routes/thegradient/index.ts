import { Route, DataItem } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/posts',
    categories: ['blog'],
    example: '/thegradient/posts',
    radar: [
        {
            source: ['thegradient.pub/'],
        },
    ],
    url: 'thegradient.pub/',
    name: 'Posts',
    maintainers: ['liyaozhong'],
    handler,
    description: 'The Gradient Blog Posts',
};

async function handler() {
    const rootUrl = 'https://thegradient.pub';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);
    const $ = load(response.data);

    let items = $('.c-post-card-wrap')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('.c-post-card__title-link').first();
            const $meta = $item.find('.c-post-card__meta');

            const href = $link.attr('href');
            const title = $link.text().trim();
            const dateStr = $meta.find('time').attr('datetime');

            if (!href || !title || !dateStr) {
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

                        item.description = $detail('.c-content').html() || '';

                        return item as DataItem;
                    } catch {
                        return item;
                    }
                })
            )
        )
    ).filter((item): item is DataItem => item !== null);

    return {
        title: 'The Gradient Blog',
        link: rootUrl,
        item: items,
    };
}
