import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/:id',
    categories: ['government'],
    example: '/hbsea/19',
    parameters: { id: '栏目 id，见下表，也支持官网路径中的文件名（如 19.html）' },
    radar: [
        {
            source: ['www.hbsea.org.cn/portal/list/index/id/:id'],
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
    const id = (ctx.req.param('id') ?? '').replace(/\.html$/, '');
    if (!/^0*[1-9]\d*$/.test(id)) {
        throw new InvalidParameterError('Invalid channel id: expected a positive integer or its .html filename.');
    }

    const currentUrl = `${rootUrl}/portal/list/index/id/${id}.html`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const list = $('ul.list li a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const date = $item.find('.text i').text();
            return {
                title: $item.find('b').text(),
                link: new URL($item.attr('href')!, rootUrl).href,
                pubDate: date ? parseDateInTimezone(date, 8) : undefined,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.text-content').html();
                const date = content('meta[name="PubDate"]').attr('content');
                if (date) {
                    item.pubDate = parseDateInTimezone(date, 8);
                }
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `湖北软协 - ${$('.gl-title-box span').text()}`,
        link: currentUrl,
        item: items,
    };
}
