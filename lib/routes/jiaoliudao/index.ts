import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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
        pubDate: parseGmtDate(item.date_gmt),
        updated: parseGmtDate(item.modified_gmt),
        link: item.link,
    }));

    return {
        title: '交流岛资源网-专注网络资源收集',
        image: `${baseUrl}/favicon.ico`,
        link: baseUrl,
        item: items,
    };
}

function parseGmtDate(value?: string): Date | undefined {
    return value && Number.isFinite(parseDate(value, 'YYYY-MM-DDTHH:mm:ss', true).getTime()) ? parseDate(`${value}Z`) : undefined;
}
