import { load } from 'cheerio';

import { config } from '@/config';
import { solveWafChallenge } from '@/routes/juejin/utils';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { LiveRoomUserInfo } from './types';

const baseUrl = 'https://www.tiktok.com';

export const route: Route = {
    path: '/live/:user',
    categories: ['social-media'],
    example: '/tiktok/live/@shinichifuku',
    parameters: { user: 'User ID, including @' },
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
            source: ['www.tiktok.com/:user/live'],
            target: '/live/:user',
        },
    ],
    name: 'Live',
    maintainers: ['TonyRL'],
    handler,
};

const apiGetLiveRoom = async (handle: string): Promise<LiveRoomUserInfo | null> => {
    const { data } = await ofetch(`${baseUrl}/api-live/user/room/`, {
        query: {
            aid: '1988',
            sourceType: '54',
            uniqueId: handle,
        },
    });
    return data?.user?.uniqueId ? data : null;
};

const htmlGetLiveRoom = async (link: string): Promise<LiveRoomUserInfo> => {
    let response = await ofetch(link);
    let $ = load(response);

    if ($('p#wci').hasClass('_wafchallengeid')) {
        const cookie = solveWafChallenge($('p#cs').attr('class')!);
        response = await ofetch(link, {
            headers: {
                cookie: `_wafchallengeid=${cookie};`,
            },
        });
        $ = load(response);
    }

    const sigiState = JSON.parse($('script#SIGI_STATE').text());
    return sigiState.LiveRoom.liveRoomUserInfo;
};

const checkAlive = async (roomId: string): Promise<boolean | null> => {
    const { data } = await ofetch('https://webcast.tiktok.com/webcast/room/check_alive/', {
        query: {
            aid: '1988',
            room_ids: roomId,
        },
    });
    return data?.[0]?.alive ?? null;
};

async function handler(ctx) {
    const user = ctx.req.param('user');
    const handle = user.startsWith('@') ? user.slice(1) : user;

    const link = `${baseUrl}/@${handle}/live`;

    const liveRoomUserInfo: LiveRoomUserInfo = await cache.tryGet(
        `tiktok:live:${handle}`,
        async () => {
            let info: LiveRoomUserInfo | null = await apiGetLiveRoom(handle);
            info ??= await htmlGetLiveRoom(link);

            if (!info.user.roomId) {
                return info;
            }

            const alive = await checkAlive(info.user.roomId);
            return alive === null
                ? info
                : {
                      ...info,
                      liveRoom: { ...info.liveRoom, status: alive ? 2 : 4 },
                  };
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
