import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/ss/:type',
    categories: ['university'],
    example: '/zzu/ss/xwzx',
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
            source: ['www5.zzu.edu.cn/ss/'],
        },
    ],
    name: '郑大社科院',
    maintainers: ['amandus1990'],
    handler,
    description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        xwzx: ['新闻资讯', 'https://www5.zzu.edu.cn/ss/index/skxw.htm'],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/ss/index/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.list_notice > a')
        .toArray()
        .slice(0, 10)
        .map((element) => {
            const $element = $(element);
            const link = new URL($element.attr('href'), typeDict[type][1]).href;
            const title = $element.find('h3').text().trim();

            // 获取发布时间
            // xwzx: 格式为 MM-DD，需要补全年份
            // tzgg: 格式为 yyyy-mm-dd，直接使用
            const pubDateText = $element.find('time').text().trim();
            let pubDate = null;

            if (pubDateText) {
                if (type === 'xwzx') {
                    const currentYear = new Date().getFullYear();
                    pubDate = `${currentYear}-${pubDateText}`;
                } else {
                    pubDate = pubDateText;
                }
            }

            return {
                title,
                link,
                pubDate,
            };
        });

    return {
        title: `郑大社科院-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
