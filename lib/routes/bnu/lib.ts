import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/lib/:category?',
    categories: ['university'],
    example: '/bnu/lib/zydt',
    parameters: { category: '分类，见下表，默认为 `zydt`' },
    radar: [
        {
            source: ['www.lib.bnu.edu.cn/:category/index.htm'],
            target: '/lib/:category',
        },
    ],
    name: '图书馆通知',
    maintainers: ['TonyRL'],
    handler,
    description: `| 资源动态 | 新闻动态 | 系列讲座 |
| -------- | -------- | -------- |
| zydt     | xwdt     | xljz1    |`,
};

async function handler(ctx) {
    const baseUrl = 'http://www.lib.bnu.edu.cn';
    const { category = 'zydt' } = ctx.req.param();
    const link = `${baseUrl}/${category}/index.htm`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.view-content .item-list li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('a').text(),
                link: `${baseUrl}/${category}/${$item.find('a').attr('href')}`,
                pubDate: parseDate($item.find('span > span').eq(1).text(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('#block-system-main .content .content').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
