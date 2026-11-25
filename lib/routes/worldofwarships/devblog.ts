import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/devblog',
    categories: ['game'],
    example: '/worldofwarships/devblog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['blog.worldofwarships.com'],
            target: '/devblog',
        },
    ],
    name: 'Development Blog',
    maintainers: ['SinCerely023'],
    handler,
};

interface Post {
    id: number;
    title: string;
    slug: string;
    publication_date: string;
    categories: string[];
    content: string;
    main_image: string;
}

const baseUrl = 'https://blog.worldofwarships.com/';

async function handler() {
    // The public website requests six entries on its initial page.
    const response = await ofetch<{ items: Post[] }>(new URL('api/posts/?limit=6', baseUrl).href);
    const items = await pMap(
        response.items,
        async (post) => {
            const link = new URL(`blog/${encodeURIComponent(post.slug)}`, baseUrl).href;
            const detail = await cache.tryGet(link, async () => {
                const article = await ofetch<Post>(new URL(`api/posts/${encodeURIComponent(post.slug)}/`, baseUrl).href);
                const $ = load(article.content, null, false);
                $.root().prepend($('<img>').attr('src', article.main_image));
                return { description: $.root().html() } satisfies Pick<DataItem, 'description'>;
            });
            return {
                title: post.title,
                link,
                pubDate: parseDate(post.publication_date, 'YYYY-MM-DD HH:mm:ss'),
                category: post.categories,
                author: 'Wargaming',
                description: detail.description,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: 'World of Warships - Development Blog',
        link: baseUrl,
        item: items,
        language: 'en' as const satisfies Language,
        author: 'Wargaming',
    };
}
