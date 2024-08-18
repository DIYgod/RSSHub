import { Route } from '@/types';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';

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

    // 导入 puppeteer 工具类并初始化浏览器实例
    const browser = await puppeteer();
    // 打开一个新标签页
    const page = await browser.newPage();
    // 拦截所有请求
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        // 在这次例子，我们只允许 HTML 请求
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    await page.goto(baseUrl, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();
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
    browser.close();
    return {
        title: 'Hot Toys New Products',
        link: baseUrl,
        item: items,
    };
}
