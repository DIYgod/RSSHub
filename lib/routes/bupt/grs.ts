import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';
import timezone from '@/utils/timezone';

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
    const context = await playwright();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
    });
    await page.goto(baseUrl, {
        waitUntil: 'networkidle',
    });
    const content = await page.content();

    const $ = load(content);

    const list = $('.n_list_pic li a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.attr('title'),
                link: new URL($item.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('i').text()), 8),
            };
        }) as DataItem[];

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await context.request.get(item.link!);
                const detail = await response.text();
                const $ = load(detail);
                $('.v_news_content style').remove();
                item.description = $('.v_news_content').html();
                item.author = $('.bbt span:contains("作者：")').text().replace('作者：', '');
                return item;
            })
        )
    );

    await context.close();

    return {
        title: '北京邮电大学研究生院 - 通知公告',
        link: baseUrl,
        item: out,
    };
}
