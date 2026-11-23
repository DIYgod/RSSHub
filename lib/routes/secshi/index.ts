import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';

async function getBrowserContent(link: string) {
    const { page, destroy } = await getPlaywrightPage(link, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('ul.hl-vod-list li.hl-list-item a.hl-item-thumb[href][title]', { state: 'attached', timeout: 15000 });
        if (new URL(page.url()).origin !== new URL(link).origin) {
            throw new Error('Secshi redirected away from the requested source.');
        }
        return await page.content();
    } finally {
        await destroy();
    }
}

export const route: Route = {
    path: '/:category?',
    categories: ['multimedia'],
    example: '/secshi',
    parameters: { category: '分类，见下表，默认为 `1`' },
    description: `| 电影 | 电视剧 | 动漫 | 综艺 | 短剧 | 网飞 |
| ---- | ------ | ---- | ---- | ---- | ---- |
| 1    | 2      | 3    | 4    | 5    | 30   |`,
    features: {
        antiCrawler: true,
        requirePuppeteer: true,
    },
    name: '分类',
    maintainers: ['8430177'],
    handler,
    url: 'www.secshi.com',
};

async function handler(ctx: Context): Promise<Data> {
    const { category = '1' } = ctx.req.param();
    const baseUrl = 'https://www.secshi.com';
    const link = `${baseUrl}/go/${category}.html`;

    const response = await getBrowserContent(link);

    const $ = load(response);

    const items = $('ul.hl-vod-list li.hl-list-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.hl-item-thumb');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, baseUrl).href,
                image: a.attr('data-original'),
            };
        });

    return {
        title: $('head title').text(),
        link,
        language: 'zh-CN',
        item: items,
    };
}
