import path from 'node:path';

import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { art } from '@/utils/render';

const baseUrl = 'http://www.chinadegrees.com.cn';

export const route: Route = {
    path: '/:province?',
    categories: ['study'],
    example: '/chinadegrees/11',
    parameters: { province: '省市代号，见下表，亦可在 [这里](http://www.chinadegrees.com.cn/help/provinceSwqk.html) 找到，默认为 `11`' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '各学位授予单位学位证书上网进度',
    description: `| 省市             | 代号 |
| ---------------- | ---- |
| 北京市           | 11   |
| 天津市           | 12   |
| 河北省           | 13   |
| 山西省           | 14   |
| 内蒙古自治区     | 15   |
| 辽宁省           | 21   |
| 吉林省           | 22   |
| 黑龙江省         | 23   |
| 上海市           | 31   |
| 江苏省           | 32   |
| 浙江省           | 33   |
| 安徽省           | 34   |
| 福建省           | 35   |
| 江西省           | 36   |
| 山东省           | 37   |
| 河南省           | 41   |
| 湖北省           | 42   |
| 湖南省           | 43   |
| 广东省           | 44   |
| 广西壮族自治区   | 45   |
| 海南省           | 46   |
| 重庆市           | 50   |
| 四川省           | 51   |
| 贵州省           | 52   |
| 云南省           | 53   |
| 西藏自治区       | 54   |
| 陕西省           | 61   |
| 甘肃省           | 62   |
| 青海省           | 63   |
| 宁夏回族自治区   | 64   |
| 新疆维吾尔自治区 | 65   |
| 台湾             | 71   |`,
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { province = '11' } = ctx.req.param();
    const url = `${baseUrl}/help/unitSwqk${province}.html`;

    const data = await cache.tryGet(
        url,
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('.datalist');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await browser.close();

            const $ = load(html);
            return {
                title: $('caption').text().trim(),
                items: $('.datalist tr')
                    .toArray()
                    .slice(1)
                    .map((item) => {
                        item = $(item);
                        const title = item.find('td').eq(1).text();
                        const pubDate = item.find('td').eq(2).text();
                        return {
                            title,
                            pubDate,
                            guid: `${title}:${pubDate}`,
                        };
                    })
                    .filter((item) => item.title !== 'null'),
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = data.items.map((item) => {
        item.description = art(path.join(__dirname, 'templates/description.art'), {
            title: item.title,
            pubDate: item.pubDate,
        });
        item.pubDate = parseDate(item.pubDate, 'YYYY-MM-DD');
        return item;
    });

    return {
        title: data.title,
        link: url,
        item: items,
    };
}
