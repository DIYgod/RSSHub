import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/pianyivps',
    radar: [
        {
            source: ['pianyivps.com/'],
        },
    ],
    name: '最新发布',
    maintainers: ['cnkmmk'],
    handler,
    url: 'pianyivps.com/',
};

async function handler() {
    const url = 'https://www.pianyivps.com';
    const response = await got(`${url}/wp-json/wp/v2/posts`);
    const list = response.data;
    return {
        title: '便宜VPS网',
        link: url,
        description: '便宜VPS网 - 最新发布',
        item: list.map((item) => ({
            title: item.title.rendered,
            link: item.link,
            pubDate: parseDate(item.date_gmt),
            description: item.content.rendered,
        })),
    };
}
