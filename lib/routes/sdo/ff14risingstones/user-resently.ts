import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getResently, getUserInfo } from './api';
import { INDEX_URL, REQUIRE_CONFIG } from './constant';
import { checkConfig } from './utils';

export const route: Route = {
    path: '/ff14risingstones/user-resently/:uid',
    categories: ['bbs'],
    example: '/sdo/ff14risingstones/user-resently/10008214',
    name: '游戏近况',
    maintainers: ['KarasuShin'],
    features: {
        requireConfig: REQUIRE_CONFIG,
    },
    handler,
};

async function handler(ctx: Context) {
    checkConfig();

    const uid = ctx.req.param('uid');

    const [resently, userInfo] = await Promise.all([getResently(uid), getUserInfo(uid)]);

    return {
        title: `石之家 - ${userInfo.character_name}@${userInfo.group_name} 的游戏近况`,
        link: `${INDEX_URL}#/me/info?uuid=${uid}`,
        image: userInfo.avatar,
        item: resently.map((i) => ({
            title: `${i.event_type} - ${i.detail}`,
            pubDate: timezone(parseDate(i.log_time), +8),
            guid: `sdo/ff14risingstones/resently:${uid}-${i.detail}`,
        })),
    } as Data;
}
