import { load } from 'cheerio';

import type { Route } from '@/types';
import puppeteer from '@/utils/puppeteer';

// 该网页使用了动态解析

export const route: Route = {
    path: '/dwzzb/:type',
    categories: ['university'],
    example: '/zzu/dwzzb/djgz',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['https://dwzzb.v.zzu.edu.cn/list.jsp?alias=:type'],
        },
    ],
    name: '郑大党委组织部',
    maintainers: ['misty'],
    handler,
    description: `| 党建工作 | 干部工作 | 人才工作 | 乡村振兴工作 |
| -------- | -------- | -------- | -------- |
| djgz     | gbgz     | rcgz     | fpgz     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const type_dict = {
        djgz: ['党建工作', 'DJGZ'],
        gbgz: ['干部工作', 'GBGZ'],
        rcgz: ['人才工作', 'RCGZ'],
        fpgz: ['乡村振兴工作', 'FPGZ'],
    };

    const typeAlias = type_dict[type][1];
    const url = `https://dwzzb.v.zzu.edu.cn/list.jsp?alias=${typeAlias}`;

    // 使用 puppeteer 渲染页面
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
    });

    // 获取渲染后的页面内容
    const response = await page.content();
    await browser.close();

    const $ = load(response);

    // 解析页面内容并提取文章信息
    const items = $('.newslistCon li')
        .toArray()
        .slice(0, 20)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), url).href;
            const title = $link.text().trim();

            // 尝试获取发布时间
            const pubDateText = $element.find('span.time').text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    return {
        title: `郑大党委组织部-${type_dict[type][0]}`,
        link: url,
        item: items,
    };
}
