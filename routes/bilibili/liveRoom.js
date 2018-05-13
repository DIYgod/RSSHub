const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx) => {
    let roomID = ctx.params.roomID;

    //短号查询长号
    if (parseInt(roomID, 10) < 10000) {

        const roomIDResponse = await axios({
            method: 'get',
            url: `https://api.live.bilibili.com/room/v1/Room/room_init?id=${roomID}`,
            headers: {
                'User-Agent': config.ua,
                'Referer': `https://live.bilibili.com/${roomID}`
            }
        });
        roomID = roomIDResponse.data.data.room_id;
    }

    const nameResponse = await axios({
        method: 'get',
        url: `https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${roomID}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://live.bilibili.com/${roomID}`
        }
    });

    const name = nameResponse.data.data.info.uname;

    const response = await axios({
        method: 'get',
        url: `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomID}&from=room`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://live.bilibili.com/${roomID}`
        }
    });
    const data = response.data.data;

    let liveItem = [];

    if (data.live_status === 1) {
        liveItem.push({
            title: data.title,
            description: `${ data.title}<br>${data.description}`,
            pubDate: new Date(data.live_time.replace(' ', 'T') + "+08:00").toUTCString(),
            guid: `https://live.bilibili.com/${roomID} ${data.live_time}`,
            link: `https://live.bilibili.com/${roomID}`
        });
    }

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${name} 直播间开播状态`,
        link: `https://live.bilibili.com/${roomID}`,
        description: `${name} 直播间开播了`,
        lastBuildDate: new Date().toUTCString(),
        item: liveItem,
    });
};