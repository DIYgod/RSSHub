const got = require('@/utils/got');
const cache = require('./cache');

module.exports = async (ctx) => {
    let bvid = ctx.params.bvid;
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

    ctx.state.data = {
        title: `${name} 的 评论`,
        link,
        description: `${name} 的评论`,
        item: data.map((item) => ({
            title: `${item.member.uname} : ${item.content.message}`,
            description: `${item.member.uname} : ${item.content.message}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
            link: `${link}/#reply${item.rpid}`,
        })),
    };
};
