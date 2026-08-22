import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:caty?',
    categories: ['government'],
    example: '/qzcea',
    parameters: { caty: '分类 id，默认为 `1`' },
    name: '新闻动态',
    maintainers: ['nczitzk'],
    description: `| 新闻动态 | 协会动态 | 通知公告 | 会员风采 | 政策法规 | 电商资讯 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 5        | 14       | 18       |`,
    handler,
};

async function handler(ctx: Context) {
    const { caty = '1' } = ctx.req.param();

    const rootUrl = 'http://www.qzcea.org';
    const currentUrl = `${rootUrl}/usernewscatname_nc${caty}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    $('a.news-more').remove();

    const list = $('li.clearfix div.news-right a')
        .toArray()
        .slice(0, 10)
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
                pubDate: timezone(parseDate($item.next().text().replace('时间 ：', '')), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('div.newm').html()!;

                return item;
            })
        )
    );

    return {
        title: `${$('title').text()} - 泉州市跨境电子商务协会`,
        link: currentUrl,
        item: items,
    };
}
