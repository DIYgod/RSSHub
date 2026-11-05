import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import cacheIn from './cache';
import utils from './utils';

export const route: Route = {
    path: '/user/channel/:uid/:sid/:embed?',
    categories: ['social-media'],
    example: '/bilibili/user/channel/2267573/396050',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', sid: '频道 id, 可在频道的 URL 中找到', embed: '默认为开启内嵌视频, 任意值为关闭' },
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
            target: '/user/channel/:uid/:sid',
        },
    ],
    name: 'UP 主频道的视频列表',
    maintainers: ['weirongxu'],
    handler,
};

async function handler(ctx) {
    const uid = Number.parseInt(ctx.req.param('uid'));
    const sid = Number.parseInt(ctx.req.param('sid'));
    const embed = !ctx.req.param('embed');
    const limit = getRouteLimit(ctx, 25);

    const link = `https://space.bilibili.com/${uid}/channel/seriesdetail?sid=${sid}`;

    // Fetch series metadata.
    const channelInfoLink = `https://api.bilibili.com/x/series/series?series_id=${sid}`;
    const channelInfo = await cache.tryGet(channelInfoLink, async () => {
        const response = await got(channelInfoLink, {
            headers: {
                Referer: link,
            },
        });
        // Missing series return no metadata.
        return response.data.data;
    });

    if (!channelInfo || channelInfo.meta?.mid !== uid) {
        throw new NotFoundError(`Bilibili series ${sid} was not found`);
    }
    const [username, face] = await cacheIn.getUsernameAndFaceFromUID(uid);
    const host = `https://api.bilibili.com/x/series/archives?mid=${uid}&series_id=${sid}&only_normal=true&sort=desc&pn=1&ps=${limit}`;

    const response = await got(host, {
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;
    if (!data?.archives) {
        throw new NotFoundError(`Bilibili series ${sid} has no available archive list`);
    }

    return {
        title: `${username} 的 bilibili 频道 ${channelInfo.meta.name}`,
        link,
        description: `${username} 的 bilibili 频道`,
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
