const axios = require('../../utils/axios');
const cache = require('./cache');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const name = await cache.getUsernameFromUID(ctx, uid);

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/followings?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const following = response.data.data.list;

    const out = await Promise.all(
        following.map(async (following) => {
            const mid = following.mid;

            const response = await axios({
                method: 'get',
                url: `https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${mid}`,
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                },
            });

            const data = response.data;

            if (data.data && data.data.vlist && data.data.vlist.length > 0) {
                const content = data.data.vlist[0];
                const item = {
                    title: content.title,
                    description: `${content.description}<br><img referrerpolicy="no-referrer" src="https:${content.pic}">`,
                    pubDate: new Date(content.created * 1000).toUTCString(),
                    link: `https://www.bilibili.com/video/av${content.aid}`,
                };
                return Promise.resolve(item);
            }
        })
    );

    ctx.state.data = {
        title: `${name}关注的up主投稿`,
        link: `https://space.bilibili.com/${uid}/fans/follow`,
        item: out,
    };
};
