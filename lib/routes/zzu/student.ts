import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/student/:type',
    categories: ['university'],
    example: '/zzu/student/xwzx',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www5.zzu.edu.cn/student/'],
        },
    ],
    name: '郑大学生处',
    maintainers: ['amandus1990'],
    handler,
    description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        xwzx: ['新闻资讯', 'https://www5.zzu.edu.cn/student/xwzx.htm'],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/student/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.part-list ul li')
        .toArray()
        .slice(0, 10)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.find('span').text().trim();

            // 获取发布时间 (格式: yyyy年mm月dd日)
            const pubDateText = $element.find('em').text().trim();
            let pubDate = null;

            if (pubDateText) {
                const match = pubDateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
                if (match) {
                    const year = match[1];
                    const month = match[2].padStart(2, '0');
                    const day = match[3].padStart(2, '0');
                    pubDate = `${year}-${month}-${day}`;
                }
            }

            return {
                title,
                link,
                pubDate,
            };
        });

    return {
        title: `郑大学生处-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
