// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';
const { baseUrl, getUserInfoFromUsername, getUserInfoFromId, getUserWorks } = require('./utils');

export default async (ctx) => {
    let { id } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit')) || 100;

    if (id.length !== 33) {
        id = (await getUserInfoFromUsername(id, cache.tryGet)).id;
    }

    const userInfo = await getUserInfoFromId(id, cache.tryGet);
    const userWorks = await getUserWorks(id, limit, cache.tryGet);

    const items = userWorks.map((item) => ({
        title: item.title || '无题',
        description: art(path.join(__dirname, 'templates/user.art'), { item }),
        author: item.uploaderInfo.nickName,
        pubDate: parseDate(item.createdTime, 'x'),
        link: `${baseUrl}/community/photo-details/${item.id}`,
    }));

    ctx.set('data', {
        title: userInfo.nickName,
        description: userInfo.about,
        image: userInfo.avatar.a1,
        link: `${baseUrl}/${id}`,
        item: items,
    });
};
