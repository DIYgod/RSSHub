import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zszcgd/:category?',
    categories: ['study'],
    example: '/chsi/zszcgd',
    parameters: { category: '分类，默认为招生政策' },
    name: '教育部阳光高考信息公开平台招生政策规定',
    maintainers: ['nczitzk'],
    features: {
        requirePuppeteer: true,
    },
    description: `| 招生政策 | 深化考试招生制度改革 | 教育法律法规 |
| -------- | -------------------- | ------------ |
| dnzszc   | zdgg                 | jyflfg       |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = 'dnzszc' } = ctx.req.param();

    const rootUrl = 'https://gaokao.chsi.com.cn';
    const currentUrl = `${rootUrl}/gkxx/zszcgd/${category}`;
    const { page, destroy } = await getPlaywrightPage(currentUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', async (route) => {
            await (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(route.request().resourceType()) ? route.continue() : route.abort());
        });
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.list ul li a');
        const response = await page.content();

        const $ = load(response);

        const list = $('.list ul li a')
            .slice(0, 15)
            .toArray()
            .map((item) => {
                const $item = $(item);
                const link = $item.attr('href')!;

                return {
                    title: $item.text(),
                    pubDate: timezone(parseDate($item.prev().text()), 8),
                    link: new URL(link, currentUrl).href,
                };
            });

        const ordered = ctx.req.query('sorted') === 'false' ? list : list.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
        const limit = getRouteLimit(ctx);
        const selected = ordered.slice(0, limit);
        const items = await Promise.all(
            selected.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const detailResponse = await page.request.get(item.link!);
                    if (!detailResponse.ok()) {
                        throw new Error(`Failed to fetch CHSI policy article: HTTP ${detailResponse.status()}`);
                    }
                    const detailHtml = await detailResponse.text();
                    const content = load(detailHtml);
                    const author = content('.l_news_time').text().split('来源：', 2)[1]?.trim();
                    content('.cntt, .l_news_time').remove();

                    return {
                        ...item,
                        author,
                        description: content('.list').html(),
                    };
                })
            )
        );

        return {
            title: `${$('.backb').text()} - 教育部阳光高考信息公开平台`,
            link: currentUrl,
            item: items,
        };
    } finally {
        await destroy();
    }
}
