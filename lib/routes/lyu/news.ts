import { load } from 'cheerio';
import type { Context } from 'hono';

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
    const { title, path } = map.get(type)!;

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

    const items = await Promise.all(
        list.map((item) =>
            item.link.endsWith('.psp')
                ? item
                : cache.tryGet(item.link, async () => {
                      const detailResponse = await ofetch(item.link);
                      const $detail = load(detailResponse);
                      return {
                          ...item,
                          description: $detail('.wp_articlecontent').html(),
                      };
                  })
        )
    );

    return {
        title: `临沂大学 - ${title}`,
        link: fullUrl,
        description: `临沂大学 - ${title}`,
        item: items,
    };
}
