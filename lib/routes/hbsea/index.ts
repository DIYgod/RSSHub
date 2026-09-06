import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:id',
    categories: ['government'],
    example: '/hbsea/19',
    parameters: { id: '栏目 id，见下表' },
    radar: [
        {
            source: ['www.hbsea.org.cn/portal/list/index/id/:id.html'],
            target: '/:id',
        },
    ],
    name: '栏目',
    maintainers: ['tudou027'],
    handler,
    description: `|   栏目   |  id |
| :------: | :-: |
| 通知公告 |  18 |
| 协会动态 |  19 |
| 行业资讯 |  20 |
| 企业之窗 |  21 |`,
};

const rootUrl = 'http://www.hbsea.org.cn';

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const currentUrl = `${rootUrl}/portal/list/index/id/${id}.html`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const list = $('ul.list li a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('b').text(),
                link: new URL($item.attr('href')!, rootUrl).href,
                pubDate: timezone(parseDate($item.find('.text i').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.text-content').html();
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')!, 'YYYY-MM-DD HH:mm:ss'), 8);
                return item;
            })
        )
    );

    return {
        title: `湖北软协 - ${$('.gl-title-box span').text()}`,
        link: currentUrl,
        item: items,
    };
}
