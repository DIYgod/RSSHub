import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/gs/:type',
    categories: ['university'],
    example: '/zzu/gs/xwzx',
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
            source: ['gs.zzu.edu.cn/'],
        },
    ],
    name: '郑大研究生院',
    maintainers: ['amandus1990'],
    handler,
    description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        xwzx: ['新闻资讯', 'https://gs.zzu.edu.cn/index/yjsyxw.htm'],
        tzgg: ['通知公告', 'https://gs.zzu.edu.cn/index/yjsygg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.r_list ul li')
        .toArray()
        .slice(0, 20)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.text().trim();

            // 获取发布时间
            const pubDateText = $element.find('span').text().trim().replaceAll(/[[\]]/g, '');

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    return {
        title: `郑大研究生院-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
