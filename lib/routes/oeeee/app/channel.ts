import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { parseArticle } from '../utils';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/app/channel/:id',
    name: 'Unknown',
    maintainers: ['TimWu007'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 50;
    const currentUrl = `https://api-ndapp.oeeee.com/friends.php?m=Zone&a=SpaceDoclist&uid=${id}&type=doc`;

    const { data: response } = await got(currentUrl);

    const list = response.data
        .filter((i) => i.url) // Remove banner and sticky articles.
        .map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, '../templates/description.art'), {
                thumb: item.titleimg.replaceAll(/\?x-oss-process=.*/g, ''),
                description: item.summary,
            }),
            pubDate: timezone(parseDate(item.ptime * 1000), +8),
            link: item.url,
            channel: item.author,
        }));

    const channel = list[1] ? list[1].channel : '';

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `南方都市报客户端 - ${channel}`,
        link: `https://m.mp.oeeee.com/u/${id}.html`,
        item: items,
    };
}
