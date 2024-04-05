import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/live/room/:id',
    categories: ['live'],
    example: '/lang/live/room/1352360',
    parameters: { id: '直播间 id, 可在主播直播间页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lang.live/room/:id'],
        },
    ],
    name: '直播间开播',
    maintainers: ['MittWillson'],
    handler,
};

async function handler(ctx) {
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

    return {
        title: `${name} 的浪 Play 直播`,
        description: data.live_info.sign,
        link: url,
        item,
        allowEmpty: true,
    };
}
