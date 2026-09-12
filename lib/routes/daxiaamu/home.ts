import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/home',
    categories: ['blog'],
    example: '/daxiaamu/home',
    radar: [
        {
            source: ['www.daxiaamu.com/'],
        },
    ],
    name: '首页',
    maintainers: ['kt286'],
    handler,
    url: 'www.daxiaamu.com/',
};

async function handler() {
    const baseUrl = 'https://www.daxiaamu.com';
    const posts = await ofetch(`${baseUrl}/wp-json/wp/v2/posts`, {
        query: {
            _embed: '',
        },
    });

    return {
        title: '大侠阿木博客',
        description: '杂七杂八技术博客',
        link: baseUrl,
        item: posts.map((item) => ({
            title: item.title.rendered,
            description: item.content.rendered,
            pubDate: parseDate(item.date_gmt),
            link: item.link,
            author: item._embedded.author.map((a) => a.name).join(', '),
        })),
    };
}
