// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const url = `https://www.lang.live/room/${id}`;

    const api = 'https://api.lang.live/langweb/v1/room/liveinfo';
    const {
        data: { data },
    } = await got(api, {
        searchParams: {
            room_id: id,
        },
    });

    let item = [];
    const name = data.live_info.nickname;
    if (data.live_info.live_status === 1) {
        item = [
            {
                title: `${name} 开播了`,
                link: url,
                guid: `lang:live:room:${id}:${data.live_info.live_id}`,
                description: art(path.join(__dirname, 'templates/room.art'), {
                    live_info: data.live_info,
                }),
            },
        ];
    }

    ctx.set('data', {
        title: `${name} 的浪 Play 直播`,
        description: data.live_info.sign,
        link: url,
        item,
        allowEmpty: true,
    });
};
