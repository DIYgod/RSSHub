import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/',
    example: '/jandan',
    name: 'Feed',
    maintainers: ['lonelykid', 'nczitzk', 'bigfei', 'pseudoyu'],
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jandan.net/'],
            target: '/',
        },
    ],
    handler,
};

async function handler(): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    const rootUrl = 'https://jandan.net';
    const timeline = await ofetch(`${rootUrl}/api/post/timeline?page=1&limit=10`);
    const posts: Array<{ id: number; title: string; date: string }> = timeline.data.flatMap((day) => day.posts);
    const items = await pMap(
        posts,
        async (post): Promise<DataItem> => {
            const link = `${rootUrl}/p/${post.id}`;
            const detail = await cache.tryGet(`jandan:post:${post.id}`, async () => {
                const { data } = await ofetch(`${rootUrl}/api/post/${post.id}`);
                return {
                    author: data.author?.display_name,
                    category: data.tags?.map((tag) => tag.name),
                    // The content is stored with blank lines between paragraphs, as WordPress does
                    description: data.content
                        .split(/(?:\r?\n){2,}/)
                        .map((block) => block.trim())
                        .filter(Boolean)
                        .map((block) => (block.startsWith('<blockquote') ? block : `<p>${block.replaceAll(/\r?\n/g, '<br>')}</p>`))
                        .join(''),
                };
            });
            return {
                title: post.title,
                description: detail.description,
                pubDate: parseDate(post.date),
                link,
                author: detail.author,
                category: detail.category,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '煎蛋',
        link: rootUrl,
        item: items,
    };
}
