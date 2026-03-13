import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/free',
    radar: [
        {
            source: ['free.com.tw/'],
        },
    ],
    name: '最新文章',
    maintainers: ['cnkmmk'],
    handler,
    url: 'free.com.tw/',
};

async function handler() {
    const url = 'https://free.com.tw/';
    const response = await got(`${url}/wp-json/wp/v2/posts`);
    const list = response.data;
    return {
        title: '免費資源網路社群',
        link: url,
        description: '免費資源網路社群 - 全部文章',
        item: list.map((item) => ({
            title: item.title.rendered,
            link: item.link,
            pubDate: parseDate(item.date_gmt),
            description: item.content.rendered,
        })),
    };
}
