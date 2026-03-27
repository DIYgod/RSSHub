import { decodeHTML } from 'entities';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    const info = await cache.getUserInfoFromLiveID(roomID);

    const response = await ofetch(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomID}&from=room`, {
        headers: {
            Referer: `https://live.bilibili.com/${roomID}`,
        },
    });
    const data = response.data;

    const liveItem: DataItem[] = [];

    if (data.live_status === 1) {
        liveItem.push({
            title: `${data.title} ${data.live_time}`,
            description: `<img src="${data.keyframe}"><br>${decodeHTML(data.description)}`,
            pubDate: timezone(parseDate(data.live_time), 8),
            guid: `https://live.bilibili.com/${roomID} ${data.live_time}`,
            link: `https://live.bilibili.com/${roomID}`,
        });
    }

    return {
        title: `${info.uname} 直播间开播状态`,
        link: `https://live.bilibili.com/${roomID}`,
        description: `${info.uname} 直播间开播状态`,
        image: info.face,
        item: liveItem,
        allowEmpty: true,
    };
}
