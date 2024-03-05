// @ts-nocheck
import cache from '@/utils/cache';
const { baseUrl, getBoards } = require('./utils');

export default async (ctx) => {
    const items = await getBoards(cache.tryGet);

    ctx.set('data', {
        title: '看板列表',
        link: `${baseUrl}/board/all`,
        item: items,
    });
};
