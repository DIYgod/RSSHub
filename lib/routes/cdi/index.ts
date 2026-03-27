import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:id?',
    categories: ['new-media'],
    example: '/cdi',
    parameters: { id: '分类，见下表，默认为综研国策' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    description: `| 樊纲观点 | 综研国策 | 综研观察 | 综研专访 | 综研视点 | 银湖新能源 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| 102      | 152      | 150      | 153      | 154      | 151        |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '152';

    const rootUrl = 'http://www.cdi.com.cn';
    const currentUrl = `${rootUrl}/Article/List?ColumnId=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.a-full')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: `${rootUrl}${item.attr('href')}`,
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

                item.title = content('h1').text();
                item.description = content('#info').html();
                item.pubDate = timezone(
                    parseDate(
                        content('.head p')
                            .text()
                            .match(/时间：(.*)/)[1]
                            .replaceAll(/年|月/g, '-')
                    ),
                    +8
                );

                return item;
            })
        )
    );

    return {
        title: `${$('h1').text()} - 国家高端智库/综合开发研究院`,
        link: currentUrl,
        item: items,
    };
}
