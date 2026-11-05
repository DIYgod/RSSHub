import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

const categories = {
    '2': '懷孕',
    '3': '育兒',
    '4': '母乳',
    '5': '親子關係',
    '6': '家庭生活',
    '7': '成長發展',
};

export const route: Route = {
    path: '/:caty?',
    categories: ['new-media'],
    example: '/mamibuy',
    parameters: {
        caty: {
            description: '分類，默認為全部',
            options: Object.entries(categories).map(([value, label]) => ({ value, label })),
        },
    },
    radar: [
        {
            source: ['mamibuy.com.hk/'],
        },
    ],
    name: '文章',
    maintainers: ['nczitzk'],
    description: `分類

| 懷孕 | 育兒 | 母乳 | 親子關係 | 家庭生活 | 成長發展 |
| ---- | ---- | ---- | -------- | -------- | -------- |
| 2    | 3    | 4    | 5        | 6        | 7        |`,
    handler,
    url: 'mamibuy.com.hk',
};

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();
    const requestedLimit = getRouteLimit(ctx, 10);
    const limit = Math.min(ctx.req.query('sorted') === 'false' ? requestedLimit : Math.max(10, requestedLimit), 100);
    const baseUrl = 'https://mamibuy.com.hk';

    const response = await ofetch(`${baseUrl}/wp-json/wp/v2/posts`, {
        query: {
            categories: caty,
            per_page: limit === 10 ? undefined : limit,
            _embed: '',
        },
    });

    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        guid: item.guid.rendered,
        description: item.content.rendered,
        pubDate: item.date_gmt ? parseDateInTimezone(item.date_gmt, 0) : undefined,
        author: item._embedded.author.map((author) => author.name).join(', '),
        category: item._embedded['wp:term'].flat().map((term) => term.name),
    }));

    return {
        title: `MamiBuy 媽咪幫${caty ? ` - ${categories[caty]}` : ''}`,
        link: baseUrl,
        item: items,
    };
}
