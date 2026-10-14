import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/hr/:category?/:type?',
    categories: ['university'],
    example: '/uibe/hr',
    parameters: { category: '分类，可在对应页 URL 中找到，默认为通知公告', type: '类型，可在对应页 URL 中找到，默认为空' },
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
            source: ['hr.uibe.edu.cn/:category/:type', 'hr.uibe.edu.cn/:category', 'hr.uibe.edu.cn/'],
        },
    ],
    name: '人力资源处',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
如 [通知公告](http://hr.uibe.edu.cn/tzgg) 的 URL 为 \`http://hr.uibe.edu.cn/tzgg\`，其路由为 [\`/uibe/hr/tzgg\`](https://rsshub.app/uibe/hr/tzgg)

如 [教师招聘](http://hr.uibe.edu.cn/jszp) 中的 [招聘信息](http://hr.uibe.edu.cn/jszp/zpxx) 的 URL 为 \`http://hr.uibe.edu.cn/jszp/zpxx\`，其路由为 [\`/uibe/hr/jszp/zpxx\`](https://rsshub.app/uibe/hr/jszp/zpxx)
:::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'tzgg';
    const type = ctx.req.param('type') ?? '';

    const rootUrl = 'http://hr.uibe.edu.cn';
    const currentUrl = `${rootUrl}/${category}${type ? `/${type}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.lawul, .longul')
        .find('li a')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            return {
                title: $item.find('p').text(),
                link: new URL($item.attr('href')!, `${currentUrl}/`).href,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`uibe:hr:v4:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const pubDate = parseDate(content('#shareTitle').next().text().replace('时间：', '').trim(), 'YYYY-MM-DD', true);
                return {
                    description: content('.gp-article').html(),
                    pubDate: Number.isNaN(pubDate.getTime()) ? undefined : timezone(pubDate, 8),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `${$('.picTit').text()} - 对外经济贸易大学人力资源处`,
        link: currentUrl,
        item: items,
    };
}
