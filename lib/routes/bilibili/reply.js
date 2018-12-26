const axios = require('../../utils/axios');
const cache = require('./cache');

module.exports = async (ctx) => {
    const aid = ctx.params.aid;
    const name = await cache.getVideoNameFromAid(ctx, aid);

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/v2/reply?type=1&oid=${aid}&sort=0`,
        headers: {
            Referer: `https://www.bilibili.com/video/av${aid}`,
        },
    });

    const data = response.data.data.replies;

    ctx.state.data = {
        title: `${name} 的 评论`,
        link: `https://www.bilibili.com/video/av${aid}`,
        description: `${name} 的评论`,
        item: data.map((item) => ({
            title: `${item.member.uname} : ${item.content.message}`,
            description: `#${item.floor}<br> ${item.member.uname} : ${item.content.message}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
            link: `https://www.bilibili.com/video/av${aid}/#reply${item.rpid}`,
        })),
    };
};
