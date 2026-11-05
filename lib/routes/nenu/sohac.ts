import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/sohac/:path{.+}?',
    categories: ['university'],
    example: '/nenu/sohac',
    parameters: { path: '路径，默认为通知公告' },
    name: '历史文化学院',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
若订阅 [通知公告](https://sohac.nenu.edu.cn/index/tzgg.htm)，网址为 \`https://sohac.nenu.edu.cn/index/tzgg.htm\`。截取 \`https://sohac.nenu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`index/tzgg\` 作为参数，此时路由为 [\`/nenu/sohac/index/tzgg\`](https://rsshub.app/nenu/sohac/index/tzgg)。

若订阅 [学院信息](https://sohac.nenu.edu.cn/index/xyxx.htm)，网址为 \`https://sohac.nenu.edu.cn/index/xyxx.htm\`。截取 \`https://sohac.nenu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`index/xyxx\` 作为参数，此时路由为 [\`/nenu/sohac/index/xyxx\`](https://rsshub.app/nenu/sohac/index/xyxx)。
:::`,
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 10);

    const path = ctx.req.param('path') ?? 'index/tzgg';

    const rootUrl = 'https://sohac.nenu.edu.cn';
    const currentUrl = `${rootUrl}/${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('span.data')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item).prev();
            const date = $(item)
                .text()
                .match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);

            return {
                title: $item.text(),
                pubDate: date ? parseDateInTimezone(`${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}`, 8) : undefined,
                link: new URL($item.attr('href')!, rootUrl).href,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.title = content('.biaoti').text();
                item.description = content('.v_news_content').html();
                const date = content('.sj')
                    .text()
                    .match(/(\d{4}-\d{2}-\d{2})/)?.[1];
                if (date) {
                    item.pubDate = parseDateInTimezone(date, 8);
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
