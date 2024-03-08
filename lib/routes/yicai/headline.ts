import cache from '@/utils/cache';
import { rootUrl, ProcessItems } from './utils';

export default async (ctx) => {
    const apiUrl = `${rootUrl}/api/ajax/getlistbycid?cid=48&type=1&page=1&pagesize=${ctx.req.query('limit') ?? 30}`;

    const items = await ProcessItems(apiUrl, cache.tryGet);

    ctx.set('data', {
        title: '第一财经 - 头条',
        link: rootUrl,
        item: items,
    });
};
