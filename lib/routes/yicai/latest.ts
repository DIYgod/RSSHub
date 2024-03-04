// @ts-nocheck
import cache from '@/utils/cache';
const { rootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const apiUrl = `${rootUrl}/api/ajax/getlatest?page=1&pagesize=${ctx.req.query('limit') ?? 30}`;

    const items = await ProcessItems(apiUrl, cache.tryGet);

    ctx.set('data', {
        title: '第一财经 - 最新',
        link: rootUrl,
        item: items,
    });
};
