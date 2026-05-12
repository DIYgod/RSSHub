import { load } from 'cheerio';

import type { Route } from '@/types';
import playwright from '@/utils/playwright';

export const route: Route = {
    path: '/',
    categories: ['shopping'],
    example: '/hottoys',
    radar: [
        {
            source: ['hottoys.com.hk/'],
        },
    ],
    name: 'Toys List',
    maintainers: ['jw0903'],
    handler,
    url: 'hottoys.com.hk/',
    features: {
        requirePuppeteer: true,
    },
};

async function handler() {
    const baseUrl = 'https://www.hottoys.com.hk';

    // 导入 Playwright 工具类并初始化浏览器实例
    const context = await playwright();
    // 打开一个新标签页
    const page = await context.newPage();
    // 拦截所有请求
    await page.route('**/*', (route) => {
        const request = route.request();
        // 在这次例子，我们只允许 HTML 请求
        request.resourceType() === 'document' ? route.continue() : route.abort();
    });

    await page.goto(baseUrl, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    await page.close();
    const $ = load(response);
    const items = $('li.productListItem')
        .toArray()
        .map((item) => {
            const dom = $(item);
            const a = dom.find('a').first();
            const img = dom.find('img').first();
            return {
                title: img.attr('title') ?? 'hottoys',
                link: `${baseUrl}/${a.attr('href')}`,
                description: `<img src="${baseUrl}${img.attr('src')}" />`,
                guid: a.attr('href'),
            };
        });
    await context.close();
    return {
        title: 'Hot Toys New Products',
        link: baseUrl,
        item: items,
    };
}
