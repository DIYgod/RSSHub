import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { parseDateText } from './utils';

export const route: Route = {
    path: '/qa/:category?/:state?',
    categories: ['programming'],
    example: '/quicker/qa',
    parameters: { category: '分类，见下表，默认为全部', state: '状态，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '讨论区',
    maintainers: ['Cesaryuan', 'nczitzk'],
    handler,
    description: `分类

| 使用问题 | 动作开发 | BUG 反馈 | 功能建议 |
| -------- | -------- | -------- | -------- |
| 1        | 9        | 3        | 4        |

| 动作需求 | 经验创意 | 动作推荐 | 信息发布 |
| -------- | -------- | -------- | -------- |
| 6        | 2        | 7        | 5        |

| 随便聊聊 | 异常报告 | 全部 |
| -------- | -------- | ---- |
| 8        | 10       | all  |

状态

| 全部 | 精华   | 已归档  |
| ---- | ------ | ------- |
|      | digest | achived |`,
};

async function handler(ctx) {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 25;
    const category = ctx.req.param('category') ?? 'all';
    const state = ctx.req.param('state') ?? '';

    const rootUrl = 'https://getquicker.net';
    const currentUrl = new URL('/QA', rootUrl);
    if (category !== 'all') {
        currentUrl.searchParams.set('category', category);
    }
    if (state) {
        currentUrl.searchParams.set('state', state);
    }

    const response = await got({
        method: 'get',
        url: currentUrl.href,
    });

    const $ = load(response.data);

    let items = $('a.question-title')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
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

                content('div[data-note="最后更新人信息"]').remove();

                const pubDate = content('.info-text')
                    .first()
                    .text()
                    .replace(/创建于 /, '');

                item.description = content('.topic-body').html();
                item.author = content('.user-link').first().text();
                item.pubDate = parseDateText(pubDate) ?? item.pubDate;

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl.href,
        item: items,
    };
}
