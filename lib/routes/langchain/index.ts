import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/langchain/blog',
    radar: [
        {
            source: ['blog.langchain.dev/'],
        },
    ],
    url: 'blog.langchain.dev/',
    name: 'Blog',
    maintainers: ['liyaozhong'],
    handler,
    description: 'LangChain Blog Posts',
};

async function handler() {
    const rootUrl = 'https://blog.langchain.dev';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);
    const $ = load(response.data);

    const items = await Promise.all(
        $('.posts-feed .post-card')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const $link = $item.find('.post-card__content-link').first();

                const href = $link.attr('href');
                const title = $item.find('.post-card__title').text().trim();
                const excerpt = $item.find('.post-card__excerpt').text().trim();

                if (!href || !title) {
                    return null;
                }

                const link = new URL(href, rootUrl).href;

                return {
                    title,
                    description: excerpt,
                    link,
                } as DataItem;
            })
            .filter((item): item is DataItem => item !== null)
            .map((item) =>
                cache.tryGet(item.link as string, async () => {
                    try {
                        const detailResponse = await got(item.link);
                        const $detail = load(detailResponse.data);

                        item.description = $detail('.article-content').html() || item.description;

                        return item as DataItem;
                    } catch {
                        return item;
                    }
                })
            )
    );

    return {
        title: 'LangChain Blog',
        link: rootUrl,
        item: items.filter((item): item is DataItem => item !== null),
    };
}
