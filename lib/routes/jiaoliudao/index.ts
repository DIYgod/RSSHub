import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['jiaoliudao.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
    url: 'jiaoliudao.com/',
};

async function handler(ctx) {
    const baseUrl = 'https://www.jiaoliudao.com';
    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30,
        },
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
        link: item.link,
    }));

    return {
        title: '交流岛资源网-专注网络资源收集',
        image: `${baseUrl}/favicon.ico`,
        link: baseUrl,
        item: items,
    };
}
