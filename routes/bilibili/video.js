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
        url: `https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${uid}`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data;

    ctx.state.data = {
        title: `${name} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 空间`,
        item:
            data.data &&
            data.data.vlist &&
            data.data.vlist.map((item) => ({
                title: item.title,
                description: `${item.description}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
                pubDate: new Date(item.created * 1000).toUTCString(),
                link: `https://www.bilibili.com/video/av${item.aid}`,
            })),
    };
};
