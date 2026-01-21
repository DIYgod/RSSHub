import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/xbx/:type',
    categories: ['university'],
    example: '/zzu/xbx/xwzx',
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
            source: ['https://www5.zzu.edu.cn/xbx/index/:type.htm'],
        },
    ],
    name: '郑大校长办',
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
            'https://www5.zzu.edu.cn/xbx/index/xwzx.htm',
        ],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/xbx/index/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(type_dict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.new_list3 dd')
        .slice(0, 20)
        .toArray()
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), type_dict[type][1]).href;
            const title = $link.attr('title') || $link.text().trim();

            // 尝试获取发布时间
            const pubDateText = $element.find('span.fr.gray').text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    // 保留结构以便将来扩展，当前直接返回列表项
    const items = list.map((item) => item);

    return {
        title: `郑大校长办-${type_dict[type][0]}`,
        link: type_dict[type][1],
        item: items,
    };
}
