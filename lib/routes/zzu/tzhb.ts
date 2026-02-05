import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/tzhb/:type',
    categories: ['university'],
    example: '/zzu/tzhb/gzdt',
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
            source: ['www5.zzu.edu.cn/tzhb/'],
        },
    ],
    name: '郑大党委统战部',
    maintainers: ['amandus1990'],
    handler,
    description: `| 工作动态 | 通知公告 |
| -------- | -------- |
| gzdt     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        gzdt: ['工作动态', 'https://www5.zzu.edu.cn/tzhb/index/gzdt.htm'],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/tzhb/index/tzgg1.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.main_conR li')
        .toArray()
        .slice(0, 15)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.find('em').text().trim();

            // 获取发布时间
            const pubDateText = $element.find('span').text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    return {
        title: `郑大党委统战部-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
