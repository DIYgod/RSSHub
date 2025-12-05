import path from 'node:path';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { baseUrl, getTribeDetail, getTribeSets } from './utils';

export const route: Route = {
    path: '/tribe/set/:id',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/500px/tribe/set/f5de0b8aa6d54ec486f5e79616418001',
    parameters: { id: '部落 ID' },
    name: '部落影集',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = Number.parseInt(ctx.req.query('limit')) || 100;

    const { tribe } = await getTribeDetail(id);
    const tribeSets = await getTribeSets(id, limit);

    const items = tribeSets.map((item) => ({
        title: item.title,
        description: art(path.join(__dirname, 'templates/tribeSet.art'), { item }),
        author: item.uploaderInfo.nickName,
        pubDate: parseDate(item.createdTime, 'x'),
        link: `${baseUrl}/community/set/${item.id}/details`,
    }));

    return {
        title: tribe.name,
        description: `${tribe.watchword} - ${tribe.introduce}`,
        link: `${baseUrl}/page/tribe/detail?tribeId=${id}&pagev=set`,
        image: tribe.avatar.a1,
        item: items,
    };
}
