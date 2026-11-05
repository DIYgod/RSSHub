import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { fetchItem } from './utils';

export const route: Route = {
    path: '/creation/:author/:folder?',
    categories: ['social-media'],
    example: '/gamer/creation/tpesamguo/338592',
    parameters: {
        author: '作者 ID, 即为个人小屋 URL 中 `owner` 参数',
        folder: '资料夹 ID, 即为创作资料夹 URL 中 `folder` 参数',
    },
    name: '个人小屋',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context) {
    const { author, folder } = ctx.req.param();

    const link = `https://home.gamer.com.tw/profile/index_creation.php?owner=${author}${folder ? `&folder=${folder}` : ''}`;

    const { data } = await ofetch<{ data: { list: Array<{ title: string; csn: number; nick: string; categoryName: string; ctime: string }> } }>('https://api.gamer.com.tw/home/v2/creation_list.php', {
        query: {
            owner: author,
            folder,
            page: 1,
            row: 10,
        },
    });

    let list = data.list.map((item) => ({
        title: item.title,
        link: `https://home.gamer.com.tw/artwork.php?sn=${item.csn}`,
        author: item.nick,
        category: item.categoryName,
        pubDate: timezone(parseDate(item.ctime), 8),
    }));
    const limit = getRouteLimit(ctx);
    if (limit && (ctx.req.query('sorted') === 'false' || list.every((item) => Number.isFinite(item.pubDate.getTime())))) {
        if (ctx.req.query('sorted') !== 'false') {
            list.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
        }
        list = list.slice(0, limit);
    }
    const items = await pMap(list, (item) => fetchItem(item), { concurrency: 3 });

    return {
        title: `${data.list[0]?.nick ?? author}的創作列表 - 巴哈姆特`,
        link,
        item: items,
    };
}
