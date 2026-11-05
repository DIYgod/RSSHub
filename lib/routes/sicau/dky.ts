import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/dky/:category?',
    categories: ['university'],
    example: '/sicau/dky/tzgg',
    parameters: { category: '分类，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['dky.sicau.edu.cn/'],
        },
    ],
    name: '动物科技学院',
    maintainers: ['nczitzk'],
    handler,
    url: 'dky.sicau.edu.cn/',
    description: `| 通知公告 | 学院动态 | 教学管理 | 动科大讲堂 | 就业信息 |
| -------- | -------- | -------- | ---------- | -------- |
| tzgg     | xydt     | jxgl     | dkdjt      | zpxx     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'tzgg';

    const rootUrl = 'https://dky.sicau.edu.cn';
    const currentUrl = `${rootUrl}/${category}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('a.tit')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            return {
                title: $item.attr('title') || $item.text(),
                link: `${rootUrl}/${$item.attr('href')}`,
                pubDate: timezone(parseDate($item.prev().text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`sicau:dky:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('.v_news_content').html();

                return { description: item.description };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
