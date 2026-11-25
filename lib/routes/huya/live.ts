import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

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

    const item: DataItem[] = [];
    if (roomData.isOn) {
        item.push({
            title: roomData.introduction,
            description: `<img src="${roomData.screenshot}">`,
            guid: `${roomData.liveId}:${roomData.startTime}`,
            pubDate: parseDate(roomData.startTime, 'X'),
            link: url,
        });
    }

    return {
        title: `${$('.host-name').text()}的虎牙直播`,
        link: url,
        item,
        allowEmpty: true,
    };
}
