const axios = require('axios');
const qs = require('querystring');
const config = require('../../config');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const nameResponse = await axios({
        method: 'post',
        url: 'https://space.bilibili.com/ajax/member/GetInfo',
        headers: {
            'User-Agent': config.ua,
            Referer: `https://space.bilibili.com/${uid}/`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            mid: uid,
        }),
    });
    const name = nameResponse.data.data.name;

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/v2/fav/video?vmid=${uid}&ps=30&tid=0&keyword=&pn=1&order=fav_time`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://space.bilibili.com/${uid}/#/favlist`,
        },
    });
    const data = response.data;

    ctx.state.data = {
        title: `${name} 的 bilibili 收藏夹`,
        link: `https://space.bilibili.com/${uid}/#/favlist`,
        description: `${name} 的 bilibili 收藏夹`,

        item:
            data.data &&
            data.data.archives &&
            data.data.archives.map((item) => ({
                title: item.title,
                description: `${item.desc}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
                pubDate: new Date(item.fav_at * 1000).toUTCString(),
                link: `https://www.bilibili.com/video/av${item.aid}`,
            })),
    };
};
