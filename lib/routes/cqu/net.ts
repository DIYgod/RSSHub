import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/net/:category',
    categories: ['university'],
    example: '/cqu/net/tzgg',
    parameters: { category: '分类名' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    name: '信息化办公室',
    maintainers: ['Hagb'],
    handler,
    description: `| 通知公告 | 单位动态 | 语言文字 |
| -------- | -------- | -------- |
| tzgg     | dwdt     | yywz     |`,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();

    const url = `https://net.cqu.edu.cn/index/${category}.htm`;
    const { page, destroy } = await getPlaywrightPage(url, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                ['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort();
            });
        },
        gotoConfig: { waitUntil: 'networkidle' },
    });

    let response, cookieString;
    try {
        await page.waitForSelector('li[id] p.detail', { timeout: 3000 });
        response = await page.content();
        const cookies = await page.context().cookies();
        cookieString = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    } finally {
        await destroy();
    }

    const $ = load(response);

    const links = $('li[id] > a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('p.detail').text(),
                link: new URL($item.attr('href')!, url).href,
                pubDate: timezone(parseDate($item.find('p.time').text(), 'YYYY年MM月DD日'), 8),
            };
        }) as DataItem[];

    const items = await Promise.all(
        links.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!, {
                    headers: {
                        Cookie: cookieString,
                    },
                });
                item.description = load(detailResponse)('div.v_news_content').html();
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
