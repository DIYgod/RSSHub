import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:type',
    categories: ['government'],
    example: '/bjeea/bjeeagg',
    parameters: { type: '分类名' },
    radar: [
        {
            source: ['www.bjeea.com/bjeeagg'],
            target: '/bjeeagg',
        },
        {
            source: ['www.bjeea.com/zkzc'],
            target: '/zkzc',
        },
        {
            source: ['www.bjeea.com/zkkd'],
            target: '/zkkd',
        },
    ],
    name: '通知公告',
    maintainers: ['gavin-k'],
    handler,
    description: `| 通知公告 | 招考政策 | 自考快递 |
| :------: | :------: | :------: |
|  bjeeagg |   zkzc   |   zkkd   |`,
};

const baseUrl = 'https://www.bjeea.cn/';
const siteTitle = '北京教育考试院--';

const categoryMap = {
    bjeeagg: { title: '首页 / 通知公告', suffix: 'html/bjeeagg' },
    zkzc: { title: '首页 / 招考政策', suffix: 'html/zkzc' },
    zkkd: { title: '首页 / 自考快递', suffix: 'html/zkkd' },
};

async function handler(ctx: Context) {
    const { type = 'bjeeagg' } = ctx.req.param();

    const listPageUrl = baseUrl + categoryMap[type].suffix;
    const response = await ofetch(listPageUrl);
    const $ = load(response);

    const list = $('ul.com-list>li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('a').text();
            const link = new URL($item.find('a').attr('href')!, baseUrl).href;
            return {
                title,
                pubDate: timezone(parseDate($item.find('span').text()), 8),
                link,
                guid: link,
                description: title,
            };
        }) as Array<DataItem & { link: string }>;

    const result = await Promise.all(
        list.map((item) =>
            item.link.startsWith(baseUrl)
                ? cache.tryGet(item.link, async () => {
                      const detailResponse = await ofetch(item.link);
                      item.description = load(detailResponse)('div.info-txt').html();
                      return item;
                  })
                : item
        )
    );

    return {
        title: siteTitle + categoryMap[type].title,
        link: baseUrl,
        description: siteTitle + categoryMap[type].title,
        item: result,
    };
}
