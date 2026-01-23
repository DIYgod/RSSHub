import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/zcycwb/:type',
    categories: ['university'],
    example: '/zzu/zcycwb/xwzx',
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
            source: ['www5.zzu.edu.cn/zcycwb/'],
        },
    ],
    name: '郑大资产与财务部',
    maintainers: ['amandus1990'],
    handler,
    description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        xwzx: [
            '新闻资讯', // 分类名称
            'https://www5.zzu.edu.cn/zcycwb/xwdt.htm',
        ],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/zcycwb/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.list ul li')
        .slice(0, 15)
        .toArray()
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.attr('title') || $link.text().trim();

            // 获取发布时间 (格式: [yyyy-mm-dd])
            const pubDateText = $element.find('i').text().trim().replaceAll(/[[\]]/g, '');

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    return {
        title: `郑大资产与财务部-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
