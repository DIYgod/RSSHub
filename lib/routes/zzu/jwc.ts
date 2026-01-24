import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/zzu/jwc/xwkd',
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
            source: ['www5.zzu.edu.cn/jwc/'],
        },
    ],
    name: '郑大教务部',
    maintainers: ['amandus1990'],
    handler,
    description: `| 新闻快递 | 通知公告 |
| -------- | -------- |
| xwkd     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        xwkd: ['新闻快递', 'https://www5.zzu.edu.cn/jwc/index/xwkd.htm'],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/jwc/index/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('ul.list li')
        .toArray()
        .slice(0, 15)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a.tit').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.text().trim();

            // 获取发布时间
            const pubDateText = $element.find('span').last().text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    return {
        title: `郑大教务部-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
