import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/hr/:category?',
    categories: ['university'],
    example: '/ruc/hr',
    parameters: { category: '分类，见下方说明，默认为首页通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hr.ruc.edu.cn/'],
        },
    ],
    name: '人事处',
    maintainers: ['nczitzk'],
    handler,
    url: 'hr.ruc.edu.cn/',
    description: `::: tip
分类字段处填写的是对应中国人民大学人事处分类页网址中介于 **\`http://hr.ruc.edu.cn/\`** 和 **/index.htm** 中间的一段，并将其中的 \`/\` 修改为 \`-\`。

如 [中国人民大学人事处 - 办事机构 - 教师事务办公室 - 教师通知公告](http://hr.ruc.edu.cn/bsjg/bsjsswbgs/jstzgg/index.htm) 的网址为 \`http://hr.ruc.edu.cn/bsjg/bsjsswbgs/jstzgg/index.htm\` 其中介于 **\`http://hr.ruc.edu.cn/\`** 和 **/index.htm** 中间的一段为 \`bsjg/bsjsswbgs/jstzgg\`。随后，并将其中的 \`/\` 修改为 \`-\`，可以得到 \`bsjg-bsjsswbgs-jstzgg\`。所以最终我们的路由为 [\`/ruc/hr/bsjg-bsjsswbgs-jstzgg\`](https://rsshub.app/ruc/hr/bsjg-bsjsswbgs-jstzgg)
:::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category')?.replaceAll('-', '/') ?? 'tzgg';

    const rootUrl = 'http://hr.ruc.edu.cn';
    const currentUrl = `${rootUrl}/${category}/index.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.newsList > li > a')
        .toArray()
        .flatMap((item): Array<DataItem & { link: string }> => {
            const $item = $(item);
            const href = $item.attr('href');
            const title = $item.text();
            return href && title ? [{ title, link: new URL(href, currentUrl).href }] : [];
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const description = content('.article, .neirong').first().html();
                if (!description?.trim()) {
                    throw new Error(`RUC personnel article content is unavailable: ${item.link}`);
                }
                const date = content('.articleAuthor')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                return { description, pubDate: date ? parseDateInTimezone(date, 8) : undefined };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
