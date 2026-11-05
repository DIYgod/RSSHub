import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseIndexUrl = 'https://www.scse.uestc.edu.cn/index.htm';
const host = 'https://www.scse.uestc.edu.cn/';
const prefixes = {
    1012: '【办公室】',
    1013: '【组织人事】',
    1014: '【科研科】',
    1015: '【研管科】',
    1016: '【教务科】',
    1017: '【学生科】',
    1018: '【国际办】',
    1019: '【培训工作】',
    1020: '【创新创业】',
    1022: '【安全工作】',
};
async function getCategoryDates(page: Page, categoryUrl: string): Promise<Record<string, string>> {
    await page.goto(categoryUrl, { waitUntil: 'networkidle' });
    const sourceContent1 = await page.content();
    const $ = load(sourceContent1);
    const notices = $('.text-list li').toArray();
    if (!notices.length) {
        throw new Error(`Unable to read notice publication dates from ${categoryUrl}`);
    }
    return Object.fromEntries(
        notices.map((item) => {
            const $item = $(item);
            return [new URL($item.find('a[href]').attr('href')!, categoryUrl).href, $item.find('.date').text().trim()];
        })
    );
}
export const route: Route = {
    path: '/scse',
    categories: ['university'],
    example: '/uestc/scse',
    parameters: {},
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
            source: ['scse.uestc.edu.cn/'],
        },
    ],
    name: '计算机科学与工程学院',
    maintainers: ['talengu', 'mobyw'],
    handler,
    url: 'scse.uestc.edu.cn/',
};
async function handler() {
    const { page, destroy } = await getPlaywrightPage(baseIndexUrl, {
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
        const sections = $('.s2-lswitch .i-list').slice(1).toArray();
        const sectionItems = await pMap(
            sections,
            async (section) => {
                const $section = $(section);
                const categoryUrl = new URL($section.children('a[href]').attr('href')!, host).href;
                let categoryDates: Promise<Record<string, string>> | undefined;
                return await pMap(
                    $section.find('li').toArray(),
                    async (item) => {
                        const $item = $(item);
                        let newsTitle = $item
                            .find('a[href]')
                            .contents()
                            .filter((index, element) => element.nodeType === 3)
                            .text();
                        const newsLink = new URL($item.find('a[href]').attr('href')!, host).href;
                        const { date } = await cache.tryGet(`uestc:scse:date:v1:${newsLink}`, async () => {
                            categoryDates ??= getCategoryDates(page, categoryUrl);
                            return { date: (await categoryDates)[newsLink] };
                        });
                        const parsedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseDate(date, 'YYYY-MM-DD', true) : undefined;
                        let prefix = '【其他】';
                        for (const code in prefixes) {
                            if (newsLink.search('info/' + code) === -1) {
                                continue;
                            }
                            prefix = prefixes[code];
                            break;
                        }
                        newsTitle = prefix + newsTitle;
                        return {
                            title: newsTitle,
                            link: newsLink,
                            pubDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, 8) : undefined,
                        };
                    },
                    { concurrency: 3 }
                );
            },
            { concurrency: 1 }
        );
        return {
            title: '计算机学院通知',
            link: baseIndexUrl,
            description: '电子科技大学计算机科学与工程学院通知',
            item: sectionItems.flat(),
        };
    } finally {
        await destroy();
    }
}

function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
