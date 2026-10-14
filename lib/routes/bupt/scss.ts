import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/scss/tzgg',
    categories: ['university'],
    example: '/bupt/scss/tzgg',
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
            source: ['scss.bupt.edu.cn/index/tzgg1.htm'],
            target: '/scss/tzgg',
        },
    ],
    name: '网络空间安全学院 - 通知公告',
    maintainers: ['ziri2004'],
    handler,
    url: 'scss.bupt.edu.cn',
};

async function handler() {
    const rootUrl = 'https://scss.bupt.edu.cn';
    const currentUrl = `${rootUrl}/index/tzgg1.htm`;
    const pageTitle = '通知公告';
    const selector = '.Newslist li';

    const { context, page, destroy } = await getPlaywrightPage(currentUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (request) => (['document', 'script'].includes(request.request().resourceType()) ? request.continue() : request.abort()));
        await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 12000 });
        const pageContent = await page.content();
        const $ = load(pageContent);

        const list = $(selector)
            .toArray()
            .map((item): (DataItem & { link: string; pubDateRaw: string }) | null => {
                const $item = $(item);
                const $link = $item.find('a');
                if ($link.length === 0 || !$link.attr('href')) {
                    return null;
                }

                const link = new URL($link.attr('href')!, rootUrl).href;
                const rawDate = $item.find('span').text().replace('发布时间：', '').trim();

                return {
                    title: $link.text().trim(),
                    link,
                    pubDateRaw: rawDate,
                    pubDate: timezone(parseDate(rawDate, 'YYYY-MM-DD'), 8),
                };
            })
            .filter((item) => item !== null);
        const orderedList = list;
        const entries = orderedList;
        const items = await Promise.all(
            entries.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await context.request.get(item.link, { timeout: 12000 });
                    const detailContent = await detailResponse.text();
                    const content = load(detailContent);
                    const newsContent = content('.v_news_content');

                    item.description = newsContent.html();
                    item.pubDate = timezone(parseDate(item.pubDateRaw), 8);

                    return item;
                })
            )
        );

        return {
            title: `北京邮电大学网络空间安全学院 - ${pageTitle}`,
            link: currentUrl,
            item: items,
        };
    } finally {
        await destroy();
    }
}
