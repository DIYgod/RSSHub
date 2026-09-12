import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cs_news/:type',
    categories: ['university'],
    example: '/ahau/cs_news/tzgg',
    parameters: { type: '类型名' },
    radar: [
        {
            source: ['xzxy.ahau.edu.cn/index/:type.htm'],
            target: '/cs_news/:type',
        },
    ],
    name: '人工智能学院',
    maintainers: ['SimonHu-HN'],
    handler,
    url: 'xzxy.ahau.edu.cn',
    description: `| 学院要闻 | 通知公告 |
| -------- | -------- |
| xyyw     | tzgg     |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const link = `https://xzxy.ahau.edu.cn/index/${type}.htm`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.txt-list li.flex')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.attr('title') ?? a.text(),
                link: new URL(a.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('span').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                item.description = $('.v_news_content').html()?.trim();
                return item;
            })
        )
    );

    return {
        title: `安徽农业大学人工智能学院 - ${$('.main-title h2').text().trim()}`,
        link,
        item: items,
    };
}
