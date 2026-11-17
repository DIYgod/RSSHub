import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import { fetchWithPage } from '@/utils/playwright-request';
import timezone from '@/utils/timezone';
import { isOnSite } from '@/utils/valid-host';

export const route: Route = {
    path: '/grs',
    categories: ['university'],
    example: '/bupt/grs',
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    radar: [
        {
            source: ['grs.bupt.edu.cn/tzgg.htm'],
        },
    ],
    name: '研究生院通知',
    maintainers: ['jiaming-shi'],
    handler,
    url: 'grs.bupt.edu.cn/tzgg.htm',
};

const baseUrl = 'https://grs.bupt.edu.cn/tzgg.htm';

async function handler() {
    const { page, destroy } = await getPlaywrightPage(baseUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => {
            const request = route.request();
            request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
        });
        await page.goto(baseUrl, {
            waitUntil: 'networkidle',
            timeout: 12000,
        });
        const content = await page.content();

        const $ = load(content);

        const list = $('.n_list_pic li a')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const title = $item.attr('title');
                if (title === undefined) {
                    return null;
                }
                return {
                    title,
                    link: new URL($item.attr('href')!, baseUrl).href,
                    pubDate: timezone(parseDate($item.find('i').text()), 8),
                };
            })
            .filter((item) => item !== null);
        const orderedList = list;
        const entries = orderedList;
        const out = await Promise.all(
            entries.map((item) => {
                // only follow links on the site itself
                if (!isOnSite(item.link, 'bupt.edu.cn')) {
                    return item;
                }
                return cache.tryGet(item.link!, async () => {
                    const response = await fetchWithPage(page, item.link!, { timeout: 12000 });
                    const detail = response.text;
                    const $ = load(detail);
                    $('.v_news_content style').remove();
                    return {
                        ...item,
                        description: $('.v_news_content').html(),
                        author: $('.bbt span:contains("作者：")').text().replace('作者：', ''),
                    };
                });
            })
        );

        return {
            title: '北京邮电大学研究生院 - 通知公告',
            link: baseUrl,
            item: out,
        };
    } finally {
        await destroy();
    }
}
