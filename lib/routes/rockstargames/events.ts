import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const gameList = new Set(['GTAV', 'RDR2']);
const eventTypeName = { InGameBonus: '游戏内奖励', InGameUnlock: '游戏内解锁', InGameDiscount: '游戏内折扣' };

export const route: Route = {
    path: '/socialclub/events/:game?',
    categories: ['game'],
    example: '/rockstargames/socialclub/events/GTAV',
    parameters: { game: '游戏代码（默认所有）' },
    name: '在线活动',
    maintainers: ['kookxiang'],
    description: `| 游戏代码 | 游戏名称     |
| -------- | ------------ |
| GTAV     | 侠盗猎车手 5 |
| RDR2     | 荒野大镖客 2 |`,
    handler,
};

async function handler(ctx: Context) {
    const { game } = ctx.req.param();
    const gameId = gameList.has(game) ? game : '';
    const baseUrl = 'https://socialclub.rockstargames.com';

    const cookies = new Map<string, string>();
    let url = `${baseUrl}/events/eventlisting?pageId=1&gameId=${gameId}&_=${Date.now()}`;
    let response;
    for (let i = 0; i < 5; i++) {
        // oxlint-disable-next-line no-await-in-loop
        response = await ofetch.raw(url, {
            redirect: 'manual',
            headers: { cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; ') },
        });
        for (const c of response.headers.getSetCookie()) {
            const pair = c.split(';', 1)[0];
            const eq = pair.indexOf('=');
            const value = pair.slice(eq + 1);
            if (value) {
                cookies.set(pair.slice(0, eq), value);
            } else {
                cookies.delete(pair.slice(0, eq));
            }
        }
        const location = response.headers.get('location');
        if (!location) {
            break;
        }
        url = new URL(location, baseUrl).href;
    }
    const { events } = response._data;

    return {
        title: '在线活动 - Rockstar Games Social Club',
        link: `${baseUrl}/events?gameId=${gameId}`,
        item: events?.map((x) => ({
            title: x.headerText,
            category: eventTypeName[x.eventType] || x.eventType,
            description: (x.imgUrl ? `<img src="${x.imgUrl}"><br>` : '') + x.description,
            pubDate: parseDate(x.startDate),
            link: x.linkToUrl ? new URL(x.linkToUrl, baseUrl).href : `${baseUrl}/events/${x.urlHash}/${x.slug}/1`,
        })),
    };
}
