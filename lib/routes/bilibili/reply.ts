// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');

export default async (ctx) => {
    let bvid = ctx.req.param('bvid');
    let aid;
    if (!bvid.startsWith('BV')) {
        aid = bvid;
        bvid = null;
    }
    const name = await cache.getVideoNameFromId(ctx, aid, bvid);
    if (!aid) {
        aid = await cache.getAidFromBvid(ctx, bvid);
    }

    const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/v2/reply?type=1&oid=${aid}&sort=0`,
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data.replies;

    ctx.set('data', {
        title: `${name} 的 评论`,
        link,
        description: `${name} 的评论`,
        item: data.map((item) => ({
            title: `${item.member.uname} : ${item.content.message}`,
            description: `${item.member.uname} : ${item.content.message}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
            link: `${link}/#reply${item.rpid}`,
        })),
    });
};
