import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
    publication_date?: string;
    categories: string[];
    short_content?: string;
    content?: string;
    main_image?: string;
}

const baseUrl = 'https://blog.worldofwarships.com/';

function parsePublicationDate(value?: string) {
    if (!value || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        return;
    }
    const date = parseDate(value, 'YYYY-MM-DD HH:mm:ss', true);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function handler() {
    // The public website requests six entries on its initial page.
    const response = await ofetch<{ items: Post[] }>(new URL('api/posts/?limit=6', baseUrl).href);
    const items = await pMap(
        response.items,
        async (post) => {
            const link = new URL(`blog/${encodeURIComponent(post.slug)}`, baseUrl).href;
            const detail = await cache.tryGet(link, async () => {
                const article = await ofetch<Post>(new URL(`api/posts/${encodeURIComponent(post.slug)}/`, baseUrl).href);
                const $ = load(article.content || '', null, false);
                if (article.main_image) {
                    $.root().prepend($('<img>').attr('src', article.main_image));
                }
                return { description: $.root().html() || undefined } satisfies Pick<DataItem, 'description'>;
            });
            return {
                title: post.title,
                link,
                pubDate: parsePublicationDate(post.publication_date),
                category: post.categories,
                author: 'Wargaming',
                description: detail.description || post.short_content,
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
