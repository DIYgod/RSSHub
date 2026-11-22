import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

interface ArticleDetail {
    content_html: string;
}

interface Article {
    slug: string;
    title: string;
    tags: string[];
    publish_date: string;
}

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/yinwang',
    name: '文章',
    maintainers: ['junbaor', 'SkiTiSu'],
    handler,
};

async function handler() {
    const url = 'https://www.yinwang.org';
    const { posts } = await ofetch<{ posts: Article[] }>(`${url}/api/v1/posts`);

    const result = await pMap(
        posts,
        async (post) => {
            const link = `${url}/posts/${post.slug}`;
            const detail = await cache.tryGet(link, async () => {
                const detail = await ofetch<ArticleDetail>(`${url}/api/v1/posts/${post.slug}`);
                return {
                    description: detail.content_html,
                };
            });
            return {
                title: post.title,
                description: detail.description,
                link,
                author: '王垠',
                category: post.tags,
                pubDate: parseDate(`${post.publish_date}T00:00:00Z`),
            };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: '王垠的博客 - 当然我在扯淡',
        link: url,
        item: result,
    };
}
