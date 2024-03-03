// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { config } from '@/config';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const data = await cache.tryGet(
        `jin10:topic:${id}`,
        async () => {
            const { data: response } = await got(`https://reference-api.jin10.com/topic/getById?id=${id}`, {
                headers: {
                    'x-app-id': 'g93rhHb9DcDptyPb',
                    'x-version': '1.0.1',
                },
            });
            return response.data;
        },
        config.cache.routeExpire,
        false
    );

    const items = await Promise.all(
        data.list.map((item) =>
            cache.tryGet(`jin10:reference:${item.id}`, async () => {
                const { data: response } = await got(`https://reference-api.jin10.com/reference/getOne?id=${item.id}&type=news`, {
                    headers: {
                        'x-app-id': 'g93rhHb9DcDptyPb',
                        'x-version': '1.0.1',
                    },
                });

                return {
                    title: item.title,
                    description: response.data.content,
                    author: item.author.nick,
                    pubDate: timezone(parseDate(item.display_datetime), 8),
                    link: `https://xnews.jin10.com/details/${item.id}`,
                };
            })
        )
    );

    ctx.set('data', {
        title: data.title,
        link: `https://xnews.jin10.com/topic/${id}`,
        description: data.introduction,
        item: items,
    });
};
