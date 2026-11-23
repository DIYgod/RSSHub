import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getPlaywrightPage } from '@/utils/playwright';
import { fetchWithPage } from '@/utils/playwright-request';
import { parseDate } from '@/utils/time';

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

    const { page, destroy } = await getPlaywrightPage(currentUrl, { noGoto: true, closeTimeout: 0 });
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
                };
            });
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const detailResponse = await fetchWithPage(page, item.link!, { timeout: 12000 });
                    const detailContent = detailResponse.text;
                    const content = load(detailContent);

                    item.description = content('.v_news_content').html();
                    item.pubDate = parseDate(content('.info span').first().text().replace('发布时间 : ', ''), 8);

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
