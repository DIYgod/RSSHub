import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/rczp',
    categories: ['university'],
    example: '/bupt/rczp',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bupt.edu.cn/'],
        },
    ],
    name: '人才招聘',
    maintainers: ['nczitzk'],
    handler,
    url: 'bupt.edu.cn/',
};

async function handler() {
    const rootUrl = 'https://www.bupt.edu.cn';
    const currentUrl = `${rootUrl}/rczp.htm`;

    const { context, page, destroy } = await getPlaywrightPage(currentUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (request) => (['document', 'script'].includes(request.request().resourceType()) ? request.continue() : request.abort()));
        await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 12000 });
        const pageContent = await page.content();
        const $ = load(pageContent);

        const list = $('.date-block')
            .toArray()
            .map((item): DataItem => {
                const $item = $(item);

                return {
                    title: $item.next().text(),
                    link: `${rootUrl}/${$item.next().attr('href')}`,
                    pubDate: timezone(parseDate(`${$item.find('.date-year').text()}-${$item.find('.date-day').text()}`, 'YYYY-MM-DD'), 8),
                };
            });
        const orderedList = list;
        const entries = orderedList;
        const items = await Promise.all(
            entries.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const detailResponse = await context.request.get(item.link!, { timeout: 12000 });
                    const detailContent = await detailResponse.text();
                    const content = load(detailContent);

                    item.description = content('.v_news_content').html();
                    item.pubDate = timezone(parseDate(content('.info span').first().text().replace('发布时间 : ', '')), 8);

                    return item;
                })
            )
        );

        return {
            title: $('title').text(),
            link: currentUrl,
            item: items,
        };
    } finally {
        await destroy();
    }
}
