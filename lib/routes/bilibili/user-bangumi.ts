import type { Route } from '@/types';
import got from '@/utils/got';

import cache from './cache';

export const route: Route = {
    path: '/user/bangumi/:uid/:type?',
    categories: ['social-media'],
    example: '/bilibili/user/bangumi/208259',
    parameters: { uid: '用户 id', type: '1为番，2为剧，留空为1' },
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
            target: '/user/bangumi/:uid',
        },
    ],
    name: '用户追番列表',
    maintainers: ['wdssmq'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const type = Number(ctx.req.param('type') || 1);
    const type_name = ((t) => ['', 'bangumi', 'cinema'][t])(type);
    const name = await cache.getUsernameFromUID(uid);

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/space/bangumi/follow/list?type=${type}&follow_status=0&pn=1&ps=15&vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/${type_name}`,
        },
    });
    const data = response.data;
    if (data.code !== 0) {
        throw new Error(`It looks like something went wrong when querying the Bilibili API: code = ${data.code}, message = ${data.message}`);
    }

    return {
        title: `${name} 的追番列表`,
        link: `https://space.bilibili.com/${uid}/${type_name}`,
        description: `${name} 的追番列表`,
        item:
            data.data &&
            data.data.list &&
            data.data.list.map((item) => ({
                title: `[${item.new_ep.index_show}]${item.title}`,
                description: `${item.evaluate}<br><img src="${item.cover}">`,
                pubDate: new Date(item.new_ep.pub_time ?? Date.now()).toUTCString(),
                link: `https://www.bilibili.com/bangumi/play/` + (item.new_ep.id ? `ep${item.new_ep.id}` : `ss${item.season_id}`),
            })),
    };
}
