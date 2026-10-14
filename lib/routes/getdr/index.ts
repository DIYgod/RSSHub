import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/getdr',
    radar: [
        {
            source: ['getdr.com/'],
            target: '',
        },
    ],
    name: '最新詐騙情報',
    maintainers: ['nczitzk'],
    handler,
    url: 'getdr.com/',
};

async function handler() {
    const rootUrl = 'https://getdr.com/最新詐騙情報';
    const apiUrl = 'https://public-api.wordpress.com/rest/v1.1/sites/demogetdr.wordpress.com/posts';

    const posts = await fetchPosts(apiUrl);

    const list = posts.map((item) => ({
        link: item.URL,
        title: item.title,
        author: item.author.name,
        pubDate: parseDate(item.date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.wp-block-image').each((_, el) => {
                    content(el).html(`<img src="${content(el).find('img').attr('data-orig-file')}">`);
                });

                item.description = content('div[data-widget_type="theme-post-content.default"]').html();

                return item;
            })
        )
    );

    return {
        title: '最新詐騙情報 - 趨勢科技防詐達人',
        link: rootUrl,
        item: items,
    };
}

async function fetchPosts(apiUrl: string) {
    try {
        const response = await got(apiUrl);
        return response.data.posts;
    } catch (error) {
        if (error instanceof FetchError && error.statusCode === 403 && error.data?.data?.error === 'unauthorized' && error.data.data.reason === 'unauthenticated') {
            throw new Error("GETDR's original WordPress blog is private. Its articles are unavailable to anonymous requests.", { cause: error });
        }
        throw error;
    }
}
