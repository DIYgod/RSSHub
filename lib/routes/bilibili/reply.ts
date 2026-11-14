import type { Route } from '@/types';
import got from '@/utils/got';

import cache from './cache';

export const route: Route = {
    path: '/video/reply/:bvid',
    categories: ['social-media'],
    example: '/bilibili/video/reply/BV1vA411b7ip',
    parameters: { bvid: '可在视频页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '视频评论',
    maintainers: ['Qixingchen'],
    handler,
};

async function handler(ctx) {
    let bvid = ctx.req.param('bvid');
    let aid;
    if (!bvid.startsWith('BV')) {
        aid = bvid;
        bvid = null;
    }
    const name = await cache.getVideoNameFromId(aid, bvid);
    if (!aid) {
        aid = await cache.getAidFromBvid(bvid);
    }
    if (!aid) {
        throw new Error(`Bilibili did not return the video ID for ${bvid}.`);
    }

    const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
    const cookie = await cache.getCookie();
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/v2/reply?type=1&oid=${aid}&sort=0`,
        headers: {
            Referer: link,
            Cookie: cookie,
        },
    });

    const { code, message, data } = response.data;
    if (code !== 0 || !data) {
        throw new Error(`Bilibili comment request failed: code = ${code}, message = ${message}`);
    }
    const { replies } = data;
    if (replies !== null && !Array.isArray(replies)) {
        throw new TypeError('Bilibili returned an invalid comment list.');
    }

    return {
        title: `${name} 的 评论`,
        link,
        description: `${name} 的评论`,
        allowEmpty: true,
        item: (replies ?? []).map((item) => ({
            title: `${item.member.uname} : ${item.content.message}`,
            description: `${item.member.uname} : ${item.content.message}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
            link: `${link}/#reply${item.rpid}`,
        })),
    };
}
