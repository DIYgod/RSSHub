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
            source: ['https://www5.zzu.edu.cn/student/'],
        },
    ],
    name: '郑大学生处',
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
            'https://www5.zzu.edu.cn/student/xwzx.htm',
        ],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/student/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(type_dict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.part-list ul li')
        .toArray()
        .slice(0, 20)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), type_dict[type][1]).href;
            const title = $link.find('span').text().trim();

            // 获取发布时间
            const pubDateText = $element.find('em').text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    // 保留结构以便将来扩展，当前直接返回列表项
    const items = list.map((item) => item);

    return {
        title: `郑大学生处-${type_dict[type][0]}`,
        link: type_dict[type][1],
        item: items,
    };
}
