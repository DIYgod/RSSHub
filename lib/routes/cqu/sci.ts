import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/sci/:category',
    categories: ['university'],
    example: '/cqu/sci/xyxw',
    parameters: { category: '分类名' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    name: '数学与统计学院',
    maintainers: ['Hagb'],
    handler,
    description: `| 学院新闻 | 学院公告 | 学院活动 | 学术活动 |
| -------- | -------- | -------- | -------- |
| xyxw     | xygg     | xyhd     | xshd1    |`,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();

    const url = `https://sci.cqu.edu.cn/index/xwzx/${category}.htm`;
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
        await page.waitForSelector('.inner-list1 a[href*="/info/"]', { state: 'attached', timeout: 3000 });
        response = await page.content();
        const cookies = await page.context().cookies();
        cookieString = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    } finally {
        await destroy();
    }

    const $ = load(response);

    const links = $('.inner-list1 a[href*="/info/"]')
        .toArray()
        .map((item) => {
            const a = $(item);
            const $item = a.closest('li');
            const dateText = $item.find('span.sspan').text() || $item.find('p.hd-p02').text().replace('时间：', '');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, url).href,
                pubDate: timezone(parseDate(dateText), 8),
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
