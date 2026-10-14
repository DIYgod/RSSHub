import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/yjsy/zhaosheng/:id?',
    categories: ['university'],
    example: '/sdust/yjsy/zhaosheng',
    parameters: { id: '栏目 id，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生招生网',
    maintainers: ['nczitzk'],
    handler,
    description: `栏目

| 招生简章 | 专业目录 | 往届录取 | 管理规定 | 资料下载 |
| -------- | -------- | -------- | -------- | -------- |
| zsjz     | zyml     | wjlq     | glgd     | zlxz     |

| 通知公告 | 博士招生 | 硕士招生 | 推免生招生 | 招生宣传 |
| -------- | -------- | -------- | ---------- | -------- |
| tzgg     | bszs     | sszs     | tms        | zsxc     |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'tzgg';

    const rootUrl = 'https://yjsy.sdust.edu.cn';
    const currentUrl = `${rootUrl}/zhaosheng/${id}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.pageUl ul li a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.attr('title')!,
                link: new URL($item.attr('href')!, currentUrl).href,
                pubDate: parseDateInTimezone($item.find('span').text(), 8),
            };
        });

    items = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`sdust:article-v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.txt, .v_news_content').html();

                return { description: item.description };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
