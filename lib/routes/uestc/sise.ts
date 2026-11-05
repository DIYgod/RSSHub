import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseUrl = 'https://sise.uestc.edu.cn/';
const mapId = {
    1: 'notice-1', // Latest
    2: 'notice-2', // Faculty office
    3: 'notice-3', // Student affairs
    4: 'notice-4', // Academic affairs
    5: 'notice-5', // Graduate affairs
    6: 'notice-6', // Organization
    7: 'notice-7', // Human resources
    8: 'notice-8', // Practical education center
    9: 'notice-9', // Int'I
};
const mapTitle = {
    1: '最新',
    2: '院办',
    3: '学生科',
    4: '教务科',
    5: '研管科',
    6: '组织',
    7: '人事',
    8: '实践教育中心',
    9: "Int'I",
};
export const route: Route = {
    path: '/sise/:type?',
    categories: ['university'],
    example: '/uestc/sise/1',
    parameters: { type: '默认为 `1`' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['sise.uestc.edu.cn/'],
            target: '/sise',
        },
    ],
    name: '信息与软件工程学院',
    maintainers: ['Yadomin', 'mobyw'],
    handler,
    url: 'sise.uestc.edu.cn/',
    description: `| 最新 | 院办 | 学生科 | 教务科 | 研管科 | 组织 | 人事 | 实践教育中心 | Int'I |
| ---- | ---- | ------ | ------ | ------ | ---- | ---- | ------------ | ----- |
| 1    | 2    | 3      | 4      | 5      | 6    | 7    | 8            | 9     |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type') || 1;
    if (!Object.hasOwn(mapId, type)) {
        throw new InvalidParameterError('Unsupported type. Use a number from 1 to 9.');
    }
    const divId = mapId[type];
    const { page, destroy } = await getPlaywrightPage(baseUrl, {
        closeTimeout: 0,
        gotoConfig: { waitUntil: 'networkidle' },
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                const request = route.request();
                isOneOf(request.resourceType(), ['document', 'script']) ? route.continue() : route.abort();
            });
        },
    });
    try {
        const sourceContent2 = await page.content();
        const $ = load(sourceContent2);
        const items = $(`div[id="${divId}"] p.news-item`).toArray();
        const out = await pMap(
            items,
            async (item) => {
                const $item = $(item);
                const newsTitle = $item.find('a').text();
                const newsLink = new URL($item.find('a').attr('href')!, baseUrl).href;
                const { date } = await cache.tryGet(`uestc:sise:date:v1:${newsLink}`, async () => {
                    await page.goto(newsLink, { waitUntil: 'networkidle' });
                    const sourceContent1 = await page.content();
                    const $article = load(sourceContent1);
                    return {
                        date: $article('.content-tip')
                            .text()
                            .match(/^\s*(\d{4}-\d{2}-\d{2})(?:\s|$)/)?.[1],
                    };
                });
                const parsedDate = date ? parseDate(date, 'YYYY-MM-DD', true) : undefined;
                return {
                    title: newsTitle,
                    link: newsLink,
                    pubDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, 8) : undefined,
                };
            },
            { concurrency: 1 }
        );
        return {
            title: `信软学院通知-${mapTitle[type]}`,
            link: baseUrl,
            description: '电子科技大学信息与软件工程学院通知',
            item: out,
        };
    } finally {
        await destroy();
    }
}

function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
