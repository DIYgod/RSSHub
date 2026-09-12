import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/chuhaibiji',
    name: '资讯',
    maintainers: ['8430177'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.chuhaibiji.com';
    const posts = await ofetch(`${baseUrl}/wp-json/wp/v2/posts`);

    return {
        title: '出海笔记 ~ 资讯',
        link: baseUrl,
        description: '出海笔记 ~ 资讯',
        item: posts.map((post) => ({
            title: post.title.rendered,
            link: post.link,
            description: post.content.rendered,
            pubDate: parseDate(post.date_gmt),
            updated: parseDate(post.modified_gmt),
        })),
    };
}
