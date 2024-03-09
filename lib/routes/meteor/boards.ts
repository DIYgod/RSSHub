import cache from '@/utils/cache';
import { baseUrl, getBoards } from './utils';

export default async (ctx) => {
    const items = await getBoards(cache.tryGet);

    ctx.set('data', {
        title: '看板列表',
        link: `${baseUrl}/board/all`,
        item: items,
    });
};
