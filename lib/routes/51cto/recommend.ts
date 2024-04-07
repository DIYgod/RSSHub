import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { getToken, sign } from './utils';

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

async function handler(ctx) {
    const url = 'https://api-media.51cto.com';
    const requestPath = 'index/index/recommend';
    const token = (await getToken()) as string;
    const timestamp = Date.now();
    const params = {
        page: 1,
        page_size: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50,
        limit_time: 0,
        name_en: '',
    };
    const response = await got(`${url}/${requestPath}`, {
        searchParams: {
            ...params,
            timestamp,
            token,
            sign: sign(requestPath, params, timestamp, token),
        },
    });
    const list = response.data.data.data.list;
    return {
        title: '51CTO',
        link: 'https://www.51cto.com/',
        description: '51cto - 推荐',
        item: list.map((item) => ({
            title: item.title,
            link: item.url,
            pubDate: parseDate(item.pubdate, +8),
            description: item.abstract,
        })),
    };
}
