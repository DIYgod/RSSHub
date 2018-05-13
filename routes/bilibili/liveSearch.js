const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx) => {
    const key = ctx.params.key;
    const order = ctx.params.order;

    const urlEncodedKey = encodeURIComponent(key);
    let orderTitle = ``;

    switch (order) {
        case "live_time":
            orderTitle = `最新开播`;
            break;
        case "online":
            orderTitle = `人气直播`;
            break;
    }

    const response = await axios({
        method: 'get',
        url: `https://search.bilibili.com/api/search?search_type=live_room&keyword=${urlEncodedKey}&order=${order}&coverType=user_cover&page=1`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://search.bilibili.com/live?keyword=${urlEncodedKey}&order=${order}&coverType=user_cover&page=1&search_type=live_user`
        }
    });
    const data = response.data.result;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `Bilibili ${key} 直播 ${orderTitle}`,
        link: `https://search.bilibili.com/live?keyword=${urlEncodedKey}&order=${order}&coverType=user_cover&page=1&search_type=live_user`,
        description: `Bilibili ${key} 直播 ${orderTitle}`,
        lastBuildDate: new Date().toUTCString(),
        item: data.map((item) => ({
            title: `${item.uname} ${item.title} `,
            description: `${item.uname} ${item.title} `,
            pubDate: new Date(item.live_time.replace(' ', 'T') + "+08:00").toUTCString(),
            link: `https://live.bilibili.com/${item.roomid}`
        })),
    });
};