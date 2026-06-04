import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/xuan/:type',
    categories: ['university'],
    example: '/zzu/xuan/gzdt',
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
            source: ['www5.zzu.edu.cn/xuan/'],
        },
    ],
    name: '郑大党委宣传部',
    maintainers: ['amandus1990'],
    handler,
    description: `| 工作动态 | 通知公告 |
| -------- | -------- |
| gzdt     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        gzdt: [
            '工作动态', // 分类名称
            'https://www5.zzu.edu.cn/xuan/gzdt.htm',
        ],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/xuan/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.list ul li')
        .slice(0, 18)
        .toArray()
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.attr('title') || $link.text().trim();

            // 尝试获取发布时间
            const pubDateText = $element.find('i').text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    return {
        title: `郑大党委宣传部-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
