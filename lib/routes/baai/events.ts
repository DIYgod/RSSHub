// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const { baseUrl, apiHost, parseEventDetail, parseItem } = require('./utils');

export default async (ctx) => {
    const responses = await got.all(
        Array.from(
            {
                // first 2 pages
                length: (ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 16) / 8,
            },
            (_, v) => `${apiHost}/api/v1/events?page=${v + 1}`
        ).map((url) => got.post(url))
    );

    const list = responses.flatMap((response) => response.data.data).map((item) => parseItem(item));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                item.description = await parseEventDetail(item);
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '活动 - 智源社区',
        link: `${baseUrl}/events`,
        item: items,
    });
};
