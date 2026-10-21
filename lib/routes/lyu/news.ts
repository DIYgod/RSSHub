import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.lyu.edu.cn/';

export const route: Route = {
    path: '/news/:type',
    categories: ['university'],
    example: '/lyu/news/ldyw',
    parameters: { type: '分类名' },
    name: '新闻',
    maintainers: ['ueiu'],
    handler,
    description: `| 临大要闻 | 信息公告 |
| -------- | -------- |
| ldyw     | xxgg     |`,
};

async function handler(ctx: Context) {
    const map = new Map([
        ['ldyw', { title: '临大要闻', path: '8125' }],
        ['xxgg', { title: '信息公告', path: '8126' }],
    ]);
    const { type } = ctx.req.param();
    const source = map.get(type);
    if (!source) {
        throw new InvalidParameterError('Invalid type. Use ldyw or xxgg.');
    }
    const { title, path } = source;

    const fullUrl = `${baseUrl}${path}/list.htm`;
    const response = await ofetch(fullUrl);
    const $ = load(response);

    const list = $('.news_list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.news_title a').text(),
                link: new URL($item.find('.news_title a').attr('href')!, baseUrl).href,
                author: '临沂大学',
                pubDate: timezone(parseDate(`${$item.find('.news_days').text()}-${$item.find('.news_year').text()}`), 8),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            if (item.link.endsWith('.psp')) {
                return item;
            }
            const description = await cache.tryGet(`lyu:article:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link);
                const $detail = load(detailResponse);
                return $detail('.wp_articlecontent').html();
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: `临沂大学 - ${title}`,
        link: fullUrl,
        description: `临沂大学 - ${title}`,
        item: items,
    };
}
