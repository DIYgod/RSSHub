import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/ippa',
    radar: [
        {
            source: ['ippa.top/'],
        },
    ],
    name: '最新文章',
    maintainers: ['cnkmmk'],
    handler,
    url: 'ippa.top/',
};

async function handler() {
    const url = 'https://www.ippa.top';
    const response = await got(`${url}/wp-json/wp/v2/posts`);
    const list = response.data;
    return {
        title: '子方有料',
        link: url,
        description: '子方有料 - 最新文章',
        item: list.map((item) => ({
            title: item.title.rendered,
            link: item.link,
            pubDate: parseDate(item.date_gmt),
            description: item.content.rendered,
        })),
    };
}
