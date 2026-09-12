import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:channel?',
    categories: ['bbs'],
    example: '/chaoli',
    parameters: { channel: '板块，见下表，默认为全部' },
    name: '板块',
    maintainers: ['nczitzk'],
    description: `| 数学 | 物理    | 化学 | 生物    | 天文  | 技术 | 管理  | 公告   |
| ---- | ------- | ---- | ------- | ----- | ---- | ----- | ------ |
| math | physics | chem | biology | astro | tech | admin | announ |

| 其他   | 语言 | 社科   | 科幻   | 辑录        |
| ------ | ---- | ------ | ------ | ----------- |
| others | lang | socsci | sci-fi | collections |`,
    handler,
};

async function handler(ctx: Context) {
    const { channel = 'all' } = ctx.req.param();

    const rootUrl = 'https://chaoli.club';
    const currentUrl = `${rootUrl}/index.php/conversations/${channel}`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('.title a')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                return {
                    ...item,
                    author: content('.info h3').eq(0).text(),
                    description: content('.postBody').eq(0).html(),
                    pubDate: parseDate(Number.parseInt(content('.info .time').attr('data-timestamp')!) * 1000),
                };
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
