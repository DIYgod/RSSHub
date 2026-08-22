import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({ html: true });

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
    const { posts } = await ofetch(`${url}/api/v1/posts`);

    const result = await Promise.all(
        posts.map((post) => {
            const link = `${url}/posts/${post.slug}`;
            return cache.tryGet(link, async () => {
                const detail = await ofetch(`${url}/api/v1/posts/${post.slug}`);
                return {
                    title: post.title,
                    description: md.render(detail.content),
                    link,
                    author: '王垠',
                    category: post.tags,
                    pubDate: parseDate(post.publish_date),
                };
            });
        })
    );

    return {
        title: '王垠的博客 - 当然我在扯淡',
        link: url,
        item: result,
    };
}
