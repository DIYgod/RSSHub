import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/upcoming/:limit?',
    categories: ['study'],
    example: '/ctfhub/upcoming',
    parameters: { limit: '一个整数，筛选最近的 limit 场比赛，默认为 5' },
    name: '查询近期赛事',
    maintainers: ['frankli0324'],
    handler,
};

const host = 'https://api.ctfhub.com';

async function getDetails(eventId: string) {
    const res = await ofetch(`${host}/User_API/Event/getInfo`, { method: 'POST', body: { event_id: eventId } });

    return res.status === true ? res.data : '';
}

async function handler(ctx: Context): Promise<Data> {
    const { limit = '5' } = ctx.req.param();

    const response = await ofetch(`${host}/User_API/Event/getUpcoming`, {
        method: 'POST',
        body: { offset: 0, limit: Number.parseInt(limit) },
    });

    if (response.status !== true) {
        throw new Error('CTFHub API returned an error');
    }

    const items = await Promise.all(
        response.data.items.map((item) =>
            cache.tryGet(`ctfhub:event:${item.id}`, async () => {
                const det = await getDetails(item.id);
                return {
                    title: item.title,
                    description: det.details,
                    pubDate: parseDate(item.start_time * 1000),
                    link: det.official_url,
                    guid: md5(item.title + item.start_time),
                };
            })
        )
    );

    return {
        title: 'CTFHub Calendar',
        link: 'https://www.ctfhub.com/#/calendar',
        description: '提供全网最全最新的 CTF 赛事信息，关注赛事定制自己专属的比赛日历吧。',
        item: items,
    };
}
