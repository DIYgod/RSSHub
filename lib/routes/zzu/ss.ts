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
            source: ['https://www5.zzu.edu.cn/ss/'],
        },
    ],
    name: '郑大社科院',
    maintainers: ['misty'],
    handler,
    description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const type_dict = {
        xwzx: [
            '新闻资讯', // 分类名称
            'https://www5.zzu.edu.cn/ss/index/skxw.htm',
        ],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/ss/index/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(type_dict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.list_notice > a')
        .toArray()
        .slice(0, 20)
        .map((element) => {
            const $element = $(element);
            const link = new URL($element.attr('href'), type_dict[type][1]).href;
            const title = $element.find('h3').text().trim();

            // 获取发布时间 (格式: MM-DD，需要补全年份)
            const pubDateText = $element.find('time').text().trim();
            const currentYear = new Date().getFullYear();
            const pubDate = pubDateText ? `${currentYear}-${pubDateText}` : null;

            return {
                title,
                link,
                pubDate,
            };
        });

    // 保留结构以便将来扩展，当前直接返回列表项
    const items = list.map((item) => item);

    return {
        title: `郑大社科院-${type_dict[type][0]}`,
        link: type_dict[type][1],
        item: items,
    };
}
