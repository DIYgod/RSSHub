import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';

import { cnuFetch, parseContent } from './utils';

const types = {
    hot: '热门',
    recommend: '推荐',
    recent: '最新',
};

export const route: Route = {
    path: '/discovery/:type?/:category?',
    categories: ['picture'],
    example: '/cnu.cc/discovery/hot',
    parameters: {
        type: '板块类型, 默认为`热门`, 具体参见下表',
        category: '图片类别, 默认为`0`代表全部, 可参见[这里](http://www.cnu.cc/discoveryPage/hot-0)',
    },
    name: '发现',
    maintainers: ['hoilc'],
    description: `| 热门 | 推荐      | 最新   |
| ---- | --------- | ------ |
| hot  | recommend | recent |`,
    handler,
};

async function handler(ctx: Context) {
    const { type = 'hot', category = '0' } = ctx.req.param();

    const url = `http://www.cnu.cc/discoveryPage/${type}-${encodeURIComponent(category)}`;

    const listResponse = await cnuFetch(url);
    const $ = load(listResponse);

    const list = $('.grid-item.work-thumbnail')
        .toArray()
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.find('.title').text().trim(),
                link: $item.find('a.thumbnail').attr('href'),
            };
        });

    const out = await Promise.all(
        list.map(async (item) => {
            try {
                return await cache.tryGet(item.link!, async () => {
                    const response = await cnuFetch(item.link!);
                    const result = parseContent(response);

                    return {
                        ...item,
                        author: result.author,
                        description: result.description,
                        pubDate: result.pubDate,
                    };
                });
            } catch {
                return null;
            }
        })
    );

    return {
        title: `CNU视觉联盟 - ${types[type]}`,
        link: url,
        item: out.filter(Boolean) as DataItem[],
    };
}
