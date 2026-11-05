import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category?',
    categories: ['university'],
    example: '/jlbtc',
    parameters: { category: '分类，见下表，默认为通知公告' },
    name: '主页',
    maintainers: ['nczitzk'],
    description: `| 工商要闻 | 工商动态 | 学术动态 | 通知公告 | 工商融媒 |
| -------- | -------- | -------- | -------- | -------- |
| gstt     | gsdt     | gsxs     | tzggnew  | gsfc     |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = 'tzggnew' } = ctx.req.param();

    const currentUrl = `https://www.jlbtc.edu.cn/sylm/${category}.htm`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.newslisttitle')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.newslisttitlex a');
            const date = $item
                .find('.wapnewsdate')
                .text()
                .match(/\d{4}-\d{1,2}-\d{1,2}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?/)?.[0];
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: date ? timezone(parseDate(date), 8) : undefined,
                description: $item.find('.newslisttitlexx').text(),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            item.link!.startsWith('https://www.jlbtc.edu.cn/')
                ? cache.tryGet(item.link!, async () => {
                      const detailResponse = await ofetch(item.link!);
                      const content = load(detailResponse);

                      item.description = content('.v_news_content').html();

                      return item;
                  })
                : item,
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
