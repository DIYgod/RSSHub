// @ts-nocheck
import got from '@/utils/got';
import queryString from 'query-string';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const res1 = await got({
        method: 'get',
        url: 'https://xueqiu.com/',
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const res2 = await got({
        method: 'get',
        url: 'https://xueqiu.com/favorites.json',
        searchParams: queryString.stringify({
            userid: id,
        }),
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });
    const data = res2.data.list;

    ctx.set('data', {
        title: `ID: ${id} 的雪球收藏动态`,
        link: `https://xueqiu.com/u/${id}`,
        description: `ID: ${id} 的雪球收藏动态`,
        item: data.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: parseDate(item.created_at),
            link: `https://xueqiu.com${item.target}`,
        })),
    });
};
