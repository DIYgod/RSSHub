import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.tiktok.com';

export const route: Route = {
    path: '/live/:user',
    categories: ['social-media'],
    example: '/tiktok/live/@shinichifuku',
    parameters: { user: 'User ID, including @' },
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
            source: ['www.tiktok.com/:user/live'],
            target: '/live/:user',
        },
    ],
    name: 'Live',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { user } = ctx.req.param();

    const link = `${baseUrl}/${user}/live`;

    const liveRoomUserInfo = await cache.tryGet(
        `tiktok:live:${user}`,
        async () => {
            const response = await ofetch(link);
            const $ = load(response);
            const sigiState = JSON.parse($('script#SIGI_STATE').text());

            return sigiState.LiveRoom.liveRoomUserInfo;
        },
        config.cache.routeExpire,
        false
    );

    const { user: userInfo, liveRoom } = liveRoomUserInfo;

    const status = liveRoom.status;
    let title: string;

    switch (status) {
        case 2:
            title = liveRoom.title || `${userInfo.nickname}'s going live now!`;
            break;
        case 4:
            title = `${userInfo.nickname} is not live currently.`;
            break;
        default:
            title = `${userInfo.nickname}'s live status is unknown (status ${status}).`;
            break;
    }

    const items = [
        {
            title,
            pubDate: parseDate(liveRoom.startTime, 'X'),
            author: userInfo.nickname,
            link,
            guid: `${userInfo.roomId}:${liveRoom.streamId}:${liveRoom.status}`,
        },
    ];

    return {
        title: `${userInfo.nickname} (@${userInfo.uniqueId})'s Live Stream - TikTok`,
        description: userInfo.signature,
        image: userInfo.avatarLarger || userInfo.avatarMedium || userInfo.avatarThumb,
        link,
        item: items,
    };
}
