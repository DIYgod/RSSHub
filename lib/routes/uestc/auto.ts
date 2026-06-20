import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

const baseIndexUrl = 'https://www.auto.uestc.edu.cn/index/tzgg1.htm';
const host = 'https://www.auto.uestc.edu.cn/';

export const route: Route = {
    path: '/auto',
    categories: ['university'],
    example: '/uestc/auto',
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
            source: ['auto.uestc.edu.cn/'],
        },
    ],
    name: '自动化工程学院',
    maintainers: ['talengu', 'mobyw'],
    handler,
    url: 'auto.uestc.edu.cn/',
};

async function handler() {
    const context = await playwright();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
    });
    await page.goto(baseIndexUrl, {
        waitUntil: 'networkidle',
    });
    const content = await page.content();
    await context.close();

    const $ = load(content);

    const items = $('dl.clearfix');

    const out = $(items)
        .toArray()
        .map((item) => {
            item = $(item);
            const newsTitle = item.find('a').text();
            const newsLink = host + item.find('a[href]').attr('href').slice(3);
            const newsPubDate = parseDate(item.find('span').text());

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsPubDate,
            };
        });

    return {
        title: '电子科技大学自动化学院通知',
        link: baseIndexUrl,
        description: '电子科技大学自动化工程学院通知',
        item: out,
    };
}
