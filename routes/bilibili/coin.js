const axios = require('axios');
const qs = require('querystring');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const nameResponse = await axios({
        method: 'post',
        url: 'https://space.bilibili.com/ajax/member/GetInfo',
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://space.bilibili.com/${uid}/`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            mid: uid
        }),
    });
    const name = nameResponse.data.data.name;

    const response = await axios({
        method: 'get',
        url: `https://space.bilibili.com/ajax/member/getCoinVideos?mid=${uid}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://space.bilibili.com/${uid}/`
        }
    });
    const data = response.data;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${name} 的 bilibili 投币视频`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 投币视频`,
        lastBuildDate: new Date().toUTCString(),
        item: data.data && data.data.list && data.data.list.map((item) => ({
            title: item.title,
            description: `${item.title}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
            link: `https://www.bilibili.com/video/av${item.stat.aid}`
        })),
    });
};