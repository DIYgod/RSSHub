import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:path{.+}?',
    name: '通用',
    example: '/gov/nopss/GB/219469',
    parameters: { path: '路径，默认为通知公告' },
    radar: [
        {
            source: ['www.nopss.gov.cn/*path/index.html', 'www.nopss.gov.cn/*path'],
            target: '/:path',
        },
    ],
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中 \`http://www.nopss.gov.cn/\` 后的字段。下面是一个例子。

若订阅 [年度项目、青年项目和西部项目](http://www.nopss.gov.cn/GB/219469/431027) 则将对应页面 URL <http://www.nopss.gov.cn/GB/219469/431027> 中 \`http://www.nopss.gov.cn/\` 后的字段 \`GB/219469/431027\` 作为路径填入。此时路由为 [\`/gov/nopss/GB/219469/431027\`](https://rsshub.app/gov/nopss/GB/219469/431027)

:::`,
};

async function handler(ctx) {
    const { path = 'GB/219469' } = ctx.req.param();

    const rootUrl = 'http://www.nopss.gov.cn';
    const currentUrl = `${rootUrl}/${path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.p2j_list_con .clearfix li a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 40)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: timezone(parseDate(item.next().text(), '[YYYY-MM-DD HH:mm]'), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.text_con').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
