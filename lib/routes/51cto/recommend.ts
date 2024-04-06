import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/index/recommend',
    categories: ['programming'],
    example: '/51cto/index/recommend',
    radar: [
        {
            source: ['51cto.com/'],
        },
    ],
    name: '推荐',
    maintainers: ['cnkmmk'],
    handler,
    url: '51cto.com/',
};

async function handler() {
    const url = 'http://api-media.51cto.com';
    const response = await got(`${url}/index/index/recommend`);
    const list = response.data.data.data.list;
    return {
        title: '51CTO',
        link: 'https://www.51cto.com/',
        description: '51cto - 推荐',
        item: list.map((item) => ({
            title: item.title,
            link: item.url,
            pubDate: parseDate(item.pubdate,+8),
            description: item.abstract,
        })),
    };
}
