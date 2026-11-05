import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['travel'],
    example: '/nippon/Politics',
    parameters: { category: '默认政治，可选如下' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['www.nippon.com/cn'] },
        { source: ['www.nippon.com/cn/politics'], target: '/Politics' },
        { source: ['www.nippon.com/cn/economy'], target: '/Economy' },
        { source: ['www.nippon.com/cn/society'], target: '/Society' },
        { source: ['www.nippon.com/cn/culture'], target: '/Culture' },
        { source: ['www.nippon.com/cn/insight'], target: '/In-depth' },
        { source: ['www.nippon.com/cn/data'], target: '/japan-data' },
        { source: ['www.nippon.com/cn/japan-glances'], target: '/japan-glances' },
        { source: ['www.nippon.com/cn/people'], target: '/People' },
        { source: ['www.nippon.com/cn/announcements'], target: '/Announcements' },
    ],
    name: '政治外交',
    description: `| 政治     | 财经    | 社会    | 日本文化 | 深度报道 | 日本信息库 | 日本一瞥      | 人物   | 编辑部通知    |
| -------- | ------- | ------- | -------- | -------- | ---------- | ------------- | ------ | ------------- |
| Politics | Economy | Society | Culture  | In-depth | japan-data | japan-glances | People | Announcements |`,
    maintainers: ['laampui'],
    handler,
};

const categoryPaths = {
    Politics: 'politics',
    Economy: 'economy',
    Society: 'society',
    Culture: 'culture',
    // The 2026 redesign moved these two and dropped the science and topics pages
    'In-depth': 'insight',
    'japan-data': 'data',
    'japan-glances': 'japan-glances',
    People: 'people',
    Announcements: 'announcements',
} satisfies Record<string, string>;

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'Politics';
    const categoryPath = categoryPaths[category];
    if (!categoryPath) {
        throw new InvalidParameterError(`Unknown category ${category}. Choose one of: ${Object.keys(categoryPaths).join(', ')}.`);
    }
    // The search API the site used before its redesign answers 404; the category page lists the latest articles
    const link = `https://www.nippon.com/cn/${categoryPath}/`;
    const res = await got.get(link);
    const $ = load(res.data);

    // The first section is 最新报道 (latest); the sections after it repeat popular articles
    const list: Array<DataItem & { link: string }> = $('section.m-section')
        .first()
        .find('a.m-card')
        .toArray()
        .map((card) => ({
            title: $(card).find('.m-card__title').text(),
            link: new URL($(card).attr('href')!, 'https://www.nippon.com').href,
        }));

    const item = await pMap(
        list.slice(0, 10),
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`nippon:details:v3:${item.link}`, async () => {
                const res = await got.get(item.link);
                const $ = load(res.data);
                const published = $('meta[property="article:published_time"]').attr('content');
                return {
                    description: $('.article-body').html(),
                    pubDate: published ? parseDate(published) : undefined,
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: `走进日本 - ${category}`,
        link,
        item,
    };
}
