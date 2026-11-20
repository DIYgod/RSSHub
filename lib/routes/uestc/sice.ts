import { load } from 'cheerio';

import type { Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';
import { parseDateStrict } from '@/utils/time';

const baseIndexUrl = 'https://www.sice.uestc.edu.cn/index.htm';

export const route: Route = {
    path: '/sice',
    categories: ['university'],
    example: '/uestc/sice',
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
            source: ['sice.uestc.edu.cn/'],
        },
    ],
    name: '信息与通信工程学院',
    maintainers: ['huyyi', 'mobyw'],
    handler,
    url: 'sice.uestc.edu.cn/',
};

async function handler() {
    const { page, destroy } = await getPlaywrightPage(baseIndexUrl, {
        closeTimeout: 0,
        gotoConfig: { waitUntil: 'networkidle' },
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                const request = route.request();
                return request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
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

    const out = $('.tzlist li')
        .toArray()
        .filter((item) => $(item).find('a[href]').attr('href'))
        .map((item) => {
            const $item = $(item);
            const yearMonth = $item.find('time em').text().trim();
            const day = $item.find('time span').text().trim();
            const date = yearMonth && day ? parseDateStrict(`${yearMonth.replace('.', '-')}-${day}`, 'YYYY-MM-DD', 8) : undefined;

            return {
                title: $item.find('.txt p').text(),
                link: new URL($item.find('a[href]').attr('href')!, baseIndexUrl).href,
                pubDate: date,
            };
        });

    return {
        title: '信通学院通知',
        link: baseIndexUrl,
        description: '电子科技大学信息与通信工程学院通知公告',
        item: out,
    };
}
