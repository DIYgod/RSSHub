import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import { baseUrl, getUserInfoFromUsername, getUserInfoFromId, getUserWorks } from './utils';

export const route: Route = {
    path: '/user/works/:id',
    categories: ['picture'],
    example: '/500px/user/works/hujunli',
    parameters: { id: '摄影师 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['500px.com.cn/:id', '500px.com.cn/community/user-details/:id', '500px.com.cn/community/user-details/:id/*'],
        },
    ],
    name: '摄影师作品',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
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

    return {
        title: userInfo.nickName,
        description: userInfo.about,
        image: userInfo.avatar.a1,
        link: `${baseUrl}/${id}`,
        item: items,
    };
}
