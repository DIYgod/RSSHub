import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const targetUrl = 'https://jwc.cupl.edu.cn/tz/tzgg.htm';
const allowedRequestTypes = new Set(['document', 'script', 'xhr', 'fetch']);

export const route: Route = {
    path: '/jwc',
    url: 'jwc.cupl.edu.cn/tz/tzgg.htm',
    categories: ['university'],
    example: '/cupl/jwc',
    description: '中国政法大学教务处通知公告',
    name: '教务处通知公告',
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
            source: ['jwc.cupl.edu.cn/tz/tzgg.htm', 'jwc.cupl.edu.cn/'],
            target: '/jwc',
        },
    ],
    maintainers: ['Fgju'],
    handler: async () => {
        const { page, destroy } = await getPlaywrightPage('https://jwc.cupl.edu.cn/', {
            closeTimeout: 0,
            onBeforeLoad: async (page) => {
                await page.route('**/*', async (route) => {
                    await (allowedRequestTypes.has(route.request().resourceType()) ? route.continue() : route.abort());
                });
            },
        });

        try {
            await page.waitForSelector('a[href="tz/tzgg.htm"]', { state: 'attached' });
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('li[id^="line_u7_"] a', { state: 'attached' });
            const listHtml = await page.content();
            const $ = load(listHtml);
            const list = $('li[id^="line_u7_"]')
                .toArray()
                .map((el) => {
                    const element = $(el);
                    const href = element.find('a').attr('href');
                    const date = `${element.find('time em').text()}-${element.find('time span').text()}`;

                    return {
                        link: href ? new URL(href, targetUrl).href : undefined,
                        title: element.find('h3').text(),
                        pubDate: timezone(parseDate(date, 'YYYY-MM-DD'), 8),
                        description: element.find('.txt p').html(),
                    };
                })
                .filter((item) => item.link);

            const items = await pMap(
                list,
                (item) =>
                    cache.tryGet(item.link!, async () => {
                        await page.goto(item.link!, { waitUntil: 'domcontentloaded' });
                        await page.waitForSelector('.v_news_content', { state: 'attached' });
                        const detailHtml = await page.content();
                        const $ = load(detailHtml);
                        const attachments = $('.detail > .txt a[href*="download.jsp"]')
                            .toArray()
                            .map((el) => {
                                const link = $(el);
                                link.attr('href', new URL(link.attr('href')!, item.link).href);
                                return `<li>${$.html(el)}</li>`;
                            });

                        return {
                            ...item,
                            description: `${$('.v_news_content').html() ?? ''}${attachments.length ? `<ul>${attachments.join('')}</ul>` : ''}`,
                        };
                    }),
                { concurrency: 1 }
            );

            return {
                title: '通知公告',
                link: targetUrl,
                description: '中国政法大学教务处通知公告',
                language: 'zh-CN',
                item: items,
            };
        } finally {
            await destroy();
        }
    },
};
