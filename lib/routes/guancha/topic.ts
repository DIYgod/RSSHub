import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topic/:id/:order?',
    categories: ['new-media'],
    example: '/guancha/topic/110/1',
    parameters: { id: '话题 id，可在URL中找到，默认为全部，即为 `0`', order: '排序参数，见下表' },
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
            source: ['guancha.cn/'],
            target: '/:category?',
        },
    ],
    name: '风闻话题',
    maintainers: ['occupy5', 'nczitzk'],
    handler,
    url: 'guancha.cn/',
    description: `| 最新回复 | 最新发布 | 24 小时最热 | 3 天最热 | 7 天最热 | 3 个月最热 | 专栏文章 |
| -------- | -------- | ----------- | -------- | -------- | ---------- | -------- |
| 1        | 2        | 3           | 6        | 7        | 8          | 5        |

::: tip
仅在话题 id 为 0，即选择 全部 时，**3 个月最热**、**24 小时最热**、**3 天最热**、**7 天最热** 和 **专栏文章** 参数生效。
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '0';
    const order = ctx.req.param('order') ?? '1';

    const rootUrl = 'https://user.guancha.cn';
    const currentUrl = `${rootUrl}/${id === '0' ? 'main/index-list.json?' : 'topic/post-list?topic_id=' + id}&page=1&order=${order}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.list-item h4 a, ul.home li .list-item h4 a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}&page=0`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.pubDate = parseRelativeDate(content('.time1').text());
                item.author = content('.user-main h4 a').first().text();
                item.description = content('.article-txt-content').html();

                return item;
            })
        )
    );

    $('h1.title span').remove();

    return {
        title: `观察者网 - ${id === '0' ? '风闻' : $('h1.title').text()}`,
        link: currentUrl,
        item: items,
    };
}
