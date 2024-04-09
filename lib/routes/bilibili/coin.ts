import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/coin/:uid/:disableEmbed?',
    categories: ['social-media'],
    example: '/bilibili/user/coin/208259',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', disableEmbed: '默认为开启内嵌视频, 任意值为关闭' },
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
            target: '/user/coin/:uid',
        },
    ],
    name: 'UP 主投币视频',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const disableEmbed = ctx.req.param('disableEmbed');

    const name = await cache.getUsernameFromUID(uid);

    const response = await got({
        url: `https://api.bilibili.com/x/space/coin/video?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const { data, code, message } = response.data;
    if (code) {
        throw new Error(message ?? code);
    }

    return {
        title: `${name} 的 bilibili 投币视频`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 投币视频`,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.desc}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`}<br><img src='${item.pic}'>`,
            pubDate: parseDate(item.time * 1000),
            link: item.time > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
            author: item.owner.name,
        })),
    };
}
