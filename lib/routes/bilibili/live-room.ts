import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';

export const route: Route = {
    path: '/live/room/:roomID',
    categories: ['live'],
    example: '/bilibili/live/room/3',
    parameters: { roomID: '房间号, 可在直播间 URL 中找到, 长短号均可' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['live.bilibili.com/:roomID'],
        },
    ],
    name: '直播开播',
    maintainers: ['Qixingchen'],
    handler,
};

async function handler(ctx) {
    let roomID = ctx.req.param('roomID');

    // 短号查询长号
    if (Number.parseInt(roomID, 10) < 10000) {
        roomID = await cache.getLiveIDFromShortID(roomID);
    }
    const name = await cache.getUsernameFromLiveID(roomID);

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

    return {
        title: `${name} 直播间开播状态`,
        link: `https://live.bilibili.com/${roomID}`,
        description: `${name} 直播间开播状态`,
        item: liveItem,
        allowEmpty: true,
    };
}
