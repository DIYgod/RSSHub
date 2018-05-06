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

    const countResponse = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/stat?vmid=${uid}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://space.bilibili.com/${uid}/`,
        }
    });
    const count = countResponse.data.data.following;

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/followings?vmid=${uid}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://space.bilibili.com/${uid}/`,
        }
    });
    const data = response.data.data.list;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${name} 的 bilibili 关注`,
        link: `https://space.bilibili.com/${uid}/#/fans/follow`,
        description: `${name} 的 bilibili 关注`,
        lastBuildDate: new Date().toUTCString(),
        item: data.map((item) => ({
            title: `${name} 新关注 ${item.uname}`,
            description: `${item.uname}<br>${item.sign}<br>总计${count}`,
            pubDate: new Date(item.mtime * 1000).toUTCString(),
            link: `https://space.bilibili.com/${item.mid}`
        })),
    });
};