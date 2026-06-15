import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { fetchData, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/xw/:category{.+}?',
    name: '新闻',
    example: '/gov/chinamine-safety/xw',
    parameters: { category: '分类，见下表，默认为应急管理部要闻' },
    radar: [
        {
            title: '应急管理部要闻',
            source: ['www.chinamine-safety.gov.cn/xw/yjglbyw/'],
            target: '/xw/yjglbyw',
        },
        {
            title: '国家矿山安监局要闻',
            source: ['www.chinamine-safety.gov.cn/xw/mkaqjcxw/'],
            target: '/xw/mkaqjcxw',
        },
        {
            title: '地方信息',
            source: ['www.chinamine-safety.gov.cn/xw/dfdt/'],
            target: '/xw/dfdt',
        },
        {
            title: '党建专栏',
            source: ['www.chinamine-safety.gov.cn/xw/djzl/'],
            target: '/xw/djzl',
        },
        {
            title: '经验交流',
            source: ['www.chinamine-safety.gov.cn/xw/jyjl/'],
            target: '/xw/jyjl',
        },
        {
            title: '新闻发布会',
            source: ['www.chinamine-safety.gov.cn/xw/xwfbh/'],
            target: '/xw/xwfbh',
        },
    ],
    maintainers: ['nczitzk'],
    handler,
    description: `| 分类               | id       |
| ------------------ | -------- |
| 应急管理部要闻     | yjglbyw  |
| 国家矿山安监局要闻 | mkaqjcxw |
| 地方信息           | dfdt     |
| 党建专栏           | djzl     |
| 经验交流           | jyjl     |
| 新闻发布会         | xwfbh    |`,
};

async function handler(ctx) {
    const { category = 'yjglbyw' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`xw/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.center_display_right table tbody tr td a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.parent().find('span').text()), +8),
            };
        });

    items = await processItems(items, cache.tryGet);

    return {
        item: items,
        ...fetchData($, currentUrl),
    };
}
