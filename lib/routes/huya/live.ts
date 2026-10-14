import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/live/:id',
    categories: ['live'],
    example: '/huya/live/edmunddzhang',
    parameters: { id: '直播间id或主播名(有一些id是名字，如上)' },
    radar: [{ source: ['huya.com/:id'] }],
    name: '直播间开播',
    maintainers: ['SettingDust', 'xyqfer'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const url = `https://www.huya.com/${id}`;
    const response = await ofetch(url);

    const $ = load(response);
    const roomDataJson = response.match(/TT_ROOM_DATA = (.*?);/)?.[1];
    if (!roomDataJson) {
        throw new Error(`Huya room ${id} did not provide public room data. Check that the room exists and the site is accessible.`);
    }
    const roomData = JSON.parse(roomDataJson);

    if (!roomData.isOn) {
        throw new Error(`Huya room ${id} is currently offline. The feed will have an item when the streamer goes live.`);
    }

    if (!Number.isFinite(Number(roomData.liveId)) || Number(roomData.liveId) <= 0) {
        throw new Error(`Huya room ${id} did not provide a valid live stream identity.`);
    }
    const startTime = Number(roomData.startTime);
    const date = Number.isFinite(startTime) && startTime > 0 ? parseDate(startTime, 'X') : undefined;
    const pubDate = date && Number.isFinite(date.getTime()) ? date : undefined;

    let item;
    if (roomData.isOn) {
        item = [
            {
                title: roomData.introduction,
                description: `<img src="${roomData.screenshot}">`,
                guid: pubDate ? `${roomData.liveId}:${roomData.startTime}` : String(roomData.liveId),
                pubDate,
                link: url,
            },
        ];
    }

    return {
        title: `${$('.host-name').text()}的虎牙直播`,
        link: url,
        item,
    };
}
