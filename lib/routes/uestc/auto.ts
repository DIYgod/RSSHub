import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseIndexUrl = 'https://www.auto.uestc.edu.cn/xwgg/tzgs.htm';

export const route: Route = {
    path: '/auto',
    categories: ['university'],
    example: '/uestc/auto',
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
            source: ['auto.uestc.edu.cn/'],
        },
    ],
    name: '自动化工程学院',
    maintainers: ['talengu', 'mobyw'],
    handler,
    url: 'auto.uestc.edu.cn/',
};

async function handler() {
    const { page, destroy } = await getPlaywrightPage(baseIndexUrl, {
        closeTimeout: 0,
        gotoConfig: { waitUntil: 'networkidle' },
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                const request = route.request();
                request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
            });
        },
    });
    let content: string;
    try {
        content = await page.content();
    } finally {
        await destroy();
    }

    const $ = load(content);

    const items = $('a.flex.wl');

    const out = $(items)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const newsTitle = $item.attr('title') ?? $item.find('h3').text();
            const newsLink = new URL($item.attr('href') ?? '', baseIndexUrl).href;
            const newsPubDate = $item.find('.date').text().trim();
            const pubDate = parseDate(`${newsPubDate.slice(0, 4)}-${newsPubDate.slice(4)}`, 'YYYY-MM-DD', true);

            return {
                title: newsTitle,
                description: $item.find('.p1').text().trim(),
                link: newsLink,
                pubDate: Number.isNaN(pubDate.getTime()) ? undefined : timezone(pubDate, 8),
            };
        });

    return {
        title: '电子科技大学自动化学院通知',
        link: baseIndexUrl,
        description: '电子科技大学自动化工程学院通知',
        item: out,
    };
}
