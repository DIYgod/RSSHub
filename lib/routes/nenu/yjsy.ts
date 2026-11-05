import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/yjsy/:path{.+}?',
    categories: ['university'],
    example: '/nenu/yjsy',
    parameters: { path: '路径，默认为通知公告' },
    name: '研究生院',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
若订阅 [通知公告](https://yjsy.nenu.edu.cn/tzgg.htm)，网址为 \`https://yjsy.nenu.edu.cn/tzgg.htm\`。截取 \`https://yjsy.nenu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`tzgg\` 作为参数，此时路由为 [\`/nenu/yjsy/tzgg\`](https://rsshub.app/nenu/yjsy/tzgg)。

若订阅 [校内新闻](https://yjsy.nenu.edu.cn/xwdt/xnxw.htm)，网址为 \`https://yjsy.nenu.edu.cn/xwdt/xnxw.htm\`。截取 \`https://yjsy.nenu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`xwdt/xnxw\` 作为参数，此时路由为 [\`/nenu/yjsy/xwdt/xnxw\`](https://rsshub.app/nenu/yjsy/xwdt/xnxw)。
:::`,
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 10);

    const path = ctx.req.param('path') ?? 'tzgg';

    const rootUrl = 'https://yjsy.nenu.edu.cn';
    const currentUrl = `${rootUrl}/${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a.tit')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const link = $item.attr('href');

            return {
                title: $item.text(),
                link: link!.startsWith('http') ? link : new URL(link!, rootUrl).href,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                if (/yjsy\.nenu\.edu\.cn/.test(item.link!)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('h2').text();
                    item.description = content('.v_news_content').html();
                    const date = content('h3')
                        .text()
                        .match(/(\d{4}-\d{2}-\d{2})/)?.[1];
                    item.pubDate = date ? parseDateInTimezone(date, 8) : undefined;
                }

                return item;
            }),
        { concurrency: 6 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
