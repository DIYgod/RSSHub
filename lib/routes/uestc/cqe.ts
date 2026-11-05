import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseUrl = 'https://cqe.uestc.edu.cn/';

const mapUrl = {
    hdyg: 'xwgg/hdyg.htm', // Event announcements
    tzgg: 'xwgg/gstz.htm', // Announcements
};

const mapTitle = {
    hdyg: '活动预告',
    tzgg: '通知公告',
};

export const route: Route = {
    path: '/cqe/:type?',
    categories: ['university'],
    example: '/uestc/cqe/tzgg',
    parameters: { type: '默认为 `tzgg`' },
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
            source: ['cqe.uestc.edu.cn/'],
            target: '/cqe',
        },
    ],
    name: '文化素质教育中心',
    maintainers: ['truobel', 'mobyw'],
    handler,
    url: 'cqe.uestc.edu.cn/',
    description: `| 活动预告 | 通知公告 |
| -------- | -------- |
| hdyg     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'tzgg';
    if (!Object.hasOwn(mapUrl, type)) {
        throw new InvalidParameterError('Unsupported type. Use hdyg or tzgg.');
    }
    const pageUrl = mapUrl[type];

    const { page, destroy } = await getPlaywrightPage(baseUrl + pageUrl, {
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

    const items = $('div.Newslist li');

    const out = $(items)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const newsTitle = $item.find('a').attr('title');
            const newsLink = baseUrl + $item.find('a').attr('href')!.slice(3);
            const newsDate = $item
                .find('span')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/)?.[0];
            const parsedDate = newsDate ? parseDate(newsDate, 'YYYY-MM-DD', true) : undefined;
            const newsPubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, 8) : undefined;

            return {
                title: newsTitle!,
                link: newsLink,
                pubDate: newsPubDate,
            };
        });

    return {
        title: `大学生文化素质教育中心-${mapTitle[type]}`,
        link: baseUrl,
        description: '电子科技大学大学生文化素质教育中心通知',
        item: out,
    };
}
