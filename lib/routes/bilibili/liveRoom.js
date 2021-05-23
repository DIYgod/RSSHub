const got = require('@/utils/got');
const cache = require('./cache');

module.exports = async (ctx) => {
    let roomID = ctx.params.roomID;

    // 短号查询长号
    if (parseInt(roomID, 10) < 10000) {
        roomID = await cache.getLiveIDFromShortID(ctx, roomID);
    }
    const name = await cache.getUsernameFromLiveID(ctx, roomID);

    const response = await got({
        method: 'get',
        url: `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomID}&from=room`,
        headers: {
            Referer: `https://live.bilibili.com/${roomID}`,
        },
    });
    const data = response.data.data;

    const liveItem = [];

    if (data.live_status === 1) {
        liveItem.push({
            title: `${data.title} ${data.live_time}`,
            description: `${data.title}<br>${data.description}`,
            pubDate: new Date(data.live_time.replace(' ', 'T') + '+08:00').toUTCString(),
            guid: `https://live.bilibili.com/${roomID} ${data.live_time}`,
            link: `https://live.bilibili.com/${roomID}`,
        });
    }

    ctx.state.data = {
        title: `${name} 直播间开播状态`,
        link: `https://live.bilibili.com/${roomID}`,
        description: `${name} 直播间开播状态`,
        item: liveItem,
        allowEmpty: true,
    };
};
