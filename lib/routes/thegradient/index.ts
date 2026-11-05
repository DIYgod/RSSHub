import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    const posts = $('.c-post-card-wrap')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('.c-post-card__title-link');
            const $meta = $item.find('.c-post-card__meta');
            const href = $link.attr('href');
            const title = $link.text();
            const dateStr = $meta.find('time').attr('datetime');
            if (!href || !title) {
                return null;
            }
            const link = new URL(href, rootUrl).href;
            const pubDate = dateStr ? parseDate(`${dateStr}T00:00:00Z`) : undefined;
            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((post) => post !== null);
    const items = await pMap(
        posts,
        async (post) => ({
            ...post,
            ...(await cache.tryGet(post.link, async (): Promise<Partial<DataItem>> => {
                try {
                    const detailResponse = await got(post.link);
                    const $detail = load(detailResponse.data);
                    const published = $detail('meta[property="article:published_time"]').attr('content');
                    const modified = $detail('meta[property="article:modified_time"]').attr('content');
                    return {
                        ...(published && { pubDate: parseDate(published) }),
                        updated: modified ? parseDate(modified) : undefined,
                        description: $detail('.c-content').html(),
                        category: $detail('meta[property="article:tag"]')
                            .toArray()
                            .map((tag) => $detail(tag).attr('content')!)
                            .filter(Boolean),
                        author:
                            $detail('.c-widget-author__title')
                                .toArray()
                                .map((author) => $detail(author).text().trim())
                                .filter(Boolean)
                                .join(', ') || undefined,
                    };
                } catch {
                    return {};
                }
            })),
        }),
        { concurrency: 3 }
    );
    return {
        title: 'The Gradient Blog',
        link: rootUrl,
        item: items,
    };
}
