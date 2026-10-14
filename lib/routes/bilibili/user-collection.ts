import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { queryToBoolean } from '@/utils/readable-social';
import { getRouteLimit } from '@/utils/route-limit';

import cache from './cache';
import utils from './utils';

export const route: Route = {
    path: '/user/collection/:uid/:sid/:embed?/:sortReverse?/:page?',
    categories: ['social-media'],
    example: '/bilibili/user/collection/245645656/529166',
    parameters: {
        uid: '用户 id, 可在 UP 主主页中找到',
        sid: '合集 id, 可在合集页面的 URL 中找到',
        embed: '默认为开启内嵌视频, 任意值为关闭',
        sortReverse: '默认:默认排序 1:升序排序',
        page: '兼容旧链接，始终返回第一页',
    },
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
            source: ['space.bilibili.com/:uid/lists/:sid'],
            target: '/user/collection/:uid/:sid',
        },
    ],
    name: 'UP 主频道的合集',
    maintainers: ['shininome', 'cscnk52'],
    handler,
};

async function handler(ctx) {
    const uid = Number.parseInt(ctx.req.param('uid'));
    const sid = Number.parseInt(ctx.req.param('sid'));
    const embed = queryToBoolean(ctx.req.param('embed') || 'true');
    const sortReverse = Number.parseInt(ctx.req.param('sortReverse')) === 1;
    const limit = getRouteLimit(ctx, 25);

    const link = `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`;
    const [username, face] = await cache.getUsernameAndFaceFromUID(uid);
    const host = `https://api.bilibili.com/x/polymer/web-space/seasons_archives_list?mid=${uid}&season_id=${sid}&sort_reverse=${sortReverse}&page_num=1&page_size=${limit}`;

    const response = await got(host, {
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;
    // The API ignores `mid`, so a series id may resolve to another user's season.
    if (!data?.archives || data.meta?.mid !== uid) {
        throw new NotFoundError(`Bilibili collection ${sid} was not found or has no available archive list`);
    }

    return {
        title: `${username} 的 bilibili 合集 ${data.meta.name}`,
        link,
        description: `${username} 的 bilibili 合集`,
        image: face ?? undefined,
        logo: face ?? undefined,
        icon: face ?? undefined,
        item: data.archives.map((item) => ({
            title: item.title,
            description: utils.renderUGCDescription(embed, item.pic, '', item.aid, undefined, item.bvid),
            pubDate: parseDate(item.pubdate, 'X'),
            link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
            author: username,
        })),
    };
}
