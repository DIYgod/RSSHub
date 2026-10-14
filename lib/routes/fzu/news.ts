import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:type',
    categories: ['university'],
    example: '/fzu/jxtz',
    parameters: { type: '分类见下表' },
    features: {
        antiCrawler: true,
    },
    name: '教务处通知',
    maintainers: ['Kare-Udon'],
    handler,
    description: `| 教学通知 | 专家讲座 |
| -------- | -------- |
| jxtz     | zjjz     |`,
};

const descriptionMap = {
    jxtz: '教学通知',
    zjjz: '嘉锡讲坛/信息素养讲座通知',
};

const urlHead = 'https://jwch.fzu.edu.cn/';

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const response = await ofetch(`${urlHead}${type}.htm`);

    const $ = load(response);
    const list = $('ul.list-gl li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('a').attr('title')!,
                link: urlHead + $item.find('a').attr('href'),
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('content.jsp')) {
                    return item;
                }
                const response = await ofetch(item.link);
                const $ = load(response);
                return {
                    ...item,
                    description: $('.articelMain').html(),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: `福州大学教务处${$('h4').text().trim()}`,
        link: `${urlHead}${type}.htm`,
        description: `福州大学教务处${descriptionMap[type] ?? ''}`,
        item: items,
    };
}
