import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/kyc/:category?',
    categories: ['university'],
    example: '/jlbtc/kyc',
    parameters: { category: '分类，见下表，默认为通知公告' },
    name: '科研处',
    maintainers: ['nczitzk'],
    description: `| 通知公告 | 新闻动态 |
| -------- | -------- |
| tzgg     | xwdt     |`,
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { category = 'tzgg' } = ctx.req.param();

    const rootUrl = 'https://kyc.jlbtc.edu.cn';
    const currentUrl = `${rootUrl}/${category}.htm`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.c48101')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}/${$item.attr('href')}`,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('#vsb_content').html();
                item.pubDate = timezone(parseDate(content('.timestyle45401').text()), 8);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items as DataItem[],
    };
}
