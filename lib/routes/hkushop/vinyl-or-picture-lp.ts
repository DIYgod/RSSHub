import { load } from 'cheerio';

import type { Route } from '@/types';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/vinyl/:cat?',
    categories: ['shopping'],
    example: '/hkushop/vinyl',
    parameters: {
        cat: '分类，见下表，默认不分类',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['hkushop.com/vinyl-or-picture-lp.html', 'hkushop.com/'],
            target: '/vinyl',
        },
    ],
    name: 'HKU Shop 黑胶专区',
    maintainers: ['gideonsenku'],
    handler,
    description: `常见分类:
| 華語音樂 | 經典復刻 | 古典跨界 | 爵士音樂 | 國際音樂 | 電影原聲帶 | 黑膠日本音樂 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 37 | 38 | 40 | 41 | 39 | 170 | 224 |`,
    url: 'hkushop.com/vinyl-or-picture-lp.html',
};

async function handler(ctx) {
    const baseUrl = 'https://hkushop.com';
    const cat = ctx.req.param('cat') ?? '';
    const url = cat ? `${baseUrl}/vinyl-or-picture-lp.html?cat=${cat}` : `${baseUrl}/vinyl-or-picture-lp.html`;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    const response = await page.content();
    await page.close();
    await browser.close();

    const $ = load(response);

    const list = $('.products.list.items.product-items .product-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('.product-item-link');
            const $price = $item.find('.price');
            const $image = $item.find('.product-image-photo');
            const $artist = $item.find('.artist a').text().trim();

            return {
                title: $link.text().trim(),
                link: $link.attr('href'),
                description: `
                <img src="${$image.attr('src')}" />
                <p>作者: ${$artist}</p>
                <p>价格: ${$price.text().trim()}</p>
            `,
                guid: $link.attr('href'),
            };
        });

    const title = cat ? `黑胶彩胶系列 - ${$('.page-title').text().trim()}` : '黑胶彩胶系列 - HKU Shop 环球唱片网店';

    return {
        title,
        link: url,
        description: 'HKU Shop 黑胶唱片最新商品信息',
        item: list,
    };
}
