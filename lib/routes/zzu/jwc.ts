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
            source: ['https://www5.zzu.edu.cn/jwc/'],
        },
    ],
    name: '郑大教务部',
    maintainers: ['misty'],
    handler,
    description: `| 新闻快递 | 通知公告 |
| -------- | -------- |
| xwkd     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const type_dict = {
        xwkd: [
            '新闻快递', // 分类名称
            'https://www5.zzu.edu.cn/jwc/index/xwkd.htm',
        ],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/jwc/index/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(type_dict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('ul.list li')
        .toArray()
        .slice(0, 20)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a.tit').first();
            const link = new URL($link.attr('href'), type_dict[type][1]).href;
            const title = $link.attr('title') || $link.text().trim();

            // 获取发布时间
            const pubDateText = $element.find('span').last().text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    // 保留结构以便将来扩展，当前直接返回列表项
    const items = list.map((item) => item);

    return {
        title: `郑大教务部-${type_dict[type][0]}`,
        link: type_dict[type][1],
        item: items,
    };
}
