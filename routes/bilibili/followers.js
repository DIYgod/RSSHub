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
    const count = countResponse.data.data.follower;

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/followers?vmid=${uid}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://space.bilibili.com/${uid}/`,
        }
    });
    const data = response.data.data.list;

    ctx.state.data = {
        title: `${name} 的 bilibili 粉丝`,
        link: `https://space.bilibili.com/${uid}/#/fans/fans`,
        description: `${name} 的 bilibili 粉丝`,
        item: data.map((item) => ({
            title: `${name} 新粉丝 ${item.uname}`,
            description: `${item.uname}<br>${item.sign}<br>总计${count}`,
            pubDate: new Date(item.mtime * 1000).toUTCString(),
            link: `https://space.bilibili.com/${item.mid}`
        })),
    };
};