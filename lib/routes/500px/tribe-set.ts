// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const { baseUrl, getTribeDetail, getTribeSets } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const limit = Number.parseInt(ctx.req.query('limit')) || 100;

    const { tribe } = await getTribeDetail(id, cache.tryGet);
    const tribeSets = await getTribeSets(id, limit, cache.tryGet);

    const items = tribeSets.map((item) => ({
        title: item.title,
        description: art(path.join(__dirname, 'templates/tribeSet.art'), { item }),
        author: item.uploaderInfo.nickName,
        pubDate: parseDate(item.createdTime, 'x'),
        link: `${baseUrl}/community/set/${item.id}/details`,
    }));

    ctx.set('data', {
        title: tribe.name,
        description: `${tribe.watchword} - ${tribe.introduce}`,
        link: `${baseUrl}/page/tribe/detail?tribeId=${id}&pagev=set`,
        image: tribe.avatar.a1,
        item: items,
    });
};
