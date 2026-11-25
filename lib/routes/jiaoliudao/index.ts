import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/jiaoliudao',
    radar: [
        {
            source: ['jiaoliudao.com/'],
            target: '',
        },
    ],
    name: '最新文章',
    maintainers: ['TonyRL'],
    handler,
    url: 'jiaoliudao.com/',
};

async function handler(ctx) {
    const baseUrl = 'https://www.jiaoliudao.com';
    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: getRouteLimit(ctx, 30),
        },
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(`${item.date_gmt}Z`),
        updated: parseDate(`${item.modified_gmt}Z`),
        link: item.link,
    }));

    return {
        title: '交流岛资源网-专注网络资源收集',
        image: `${baseUrl}/favicon.ico`,
        link: baseUrl,
        item: items,
    };
}
