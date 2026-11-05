import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getBjxPage } from './utils';

export const route: Route = {
    path: '/gf/:type',
    categories: ['traditional-media'],
    example: '/bjx/gf/sc',
    parameters: { type: '分类，北极星光伏最后的`type`字段' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '光伏',
    maintainers: ['Sxuet'],
    handler,
    description: `\`:type\` 类型可选如下

| 要闻 | 政策 | 市场行情 | 企业动态 | 独家观点 | 项目工程 | 招标采购 | 财经 | 国际行情 | 价格趋势 | 技术跟踪 |
| ---- | ---- | -------- | -------- | -------- | -------- | -------- | ---- | -------- | -------- | -------- |
| yw   | zc   | sc       | mq       | dj       | xm       | zb       | cj   | gj       | sj       | js       |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const { page, destroy } = await getBjxPage(`https://guangfu.bjx.com.cn/${type}/`);
    try {
        const data = await page.content();
        const $ = load(data);
        const list = $('div.cc-list-content ul li');
        return {
            title: $('title').text(),
            description: $('meta[name="Description"]').attr('content'),
            link: `https://guangfu.bjx.com.cn/${type}/`,
            item: list.toArray().map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('a').attr('title')!,
                    link: $item.find('a').attr('href'),
                    pubDate: timezone(parseDate($item.find('span').text()), 8),
                };
            }),
        };
    } finally {
        await destroy();
    }
}
