import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';
import utils from './utils';

export const route: Route = {
    path: '/user/like/:uid/:embed?',
    categories: ['social-media'],
    example: '/bilibili/user/like/208259',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', embed: '默认为开启内嵌视频, 任意值为关闭' },
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
            source: ['space.bilibili.com/:uid'],
            target: '/user/like/:uid',
        },
    ],
    name: 'UP 主点赞视频',
    maintainers: ['ygguorun'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const embed = !ctx.req.param('embed');

    const name = await cache.getUsernameFromUID(uid);

    const response = await got({
        url: `https://api.bilibili.com/x/space/like/video?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const { data, code, message } = response.data;
    if (code) {
        throw new Error(message ?? code);
    }

    return {
        title: `${name} 的 bilibili 点赞视频`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 点赞视频`,
        item: data.list.map((item) => ({
            title: item.title,
            description: utils.renderUGCDescription(embed, item.pic, item.desc, item.aid, undefined, item.bvid),
            pubDate: parseDate(item.pubdate * 1000),
            link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
            author: item.owner.name,
        })),
    };
}
