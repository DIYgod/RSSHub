import { Data, DataItem, Route, ViewType } from '@/types';
import { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import path from 'node:path';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';

export const route: Route = {
    path: '/girl',
    name: '煎蛋妹子图',
    example: '/girl',
    maintainers: ['lemon'],
    handler,
    view: ViewType.Pictures,
};

async function handler(ctx: Context): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!) : 30;

    const items = await crawl(ctx, limit);

    return {
        title: '妹子图 - 煎蛋',
        link: 'https://jandan.net',
        item: items,
    };
}

async function crawl(ctx: Context, limit: number = 30) {
    const data = await _crawl(undefined, limit, []);
    // set debug info
    ctx.set('json', data);
    return data;
}

const __dirname = getCurrentPath(import.meta.url);
const girlDescTemplate = path.join(__dirname, 'templates/girl.art');

async function _crawl(startId?: string, limit: number = 30, items: DataItem[] = []): Promise<DataItem[]> {
    if (items.length >= limit) {
        return items;
    }

    const response = await ofetch(`https://api.jandan.net/api/v1/comment/list/108629${startId ? `?start_id=${startId}` : ''}`);
    const data: {
        id: string;
        author: string;
        date: string;
        vote_positive: string;
        vote_negative: string;
        images: { url: string; full_url: string }[];
    }[] = response.data;

    const resData: DataItem[] =
        data?.map((item) => ({
            title: item.author,
            description: art(girlDescTemplate, { images: item.images }),
            pubDate: new Date(item.date),
            link: `https://jandan.net/t/${item.id}`,
            author: item.author,
        })) || [];
    const lastItemId = data?.at(-1)?.id;
    if (lastItemId) {
        return _crawl(lastItemId, limit, [...items, ...resData]);
    }
    return [...items, ...resData];
}
