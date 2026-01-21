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
            source: ['hhttps://www5.zzu.edu.cn/tzhb/index/:type.htm'],
        },
    ],
    name: '郑大党委统战部',
    maintainers: ['misty'],
    handler,
    description: `| 工作动态 | 通知公告 |
| -------- | -------- |
| gzdt     | tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const type_dict = {
        gzdt: [
            '工作动态', // 分类名称
            'https://www5.zzu.edu.cn/tzhb/index/gzdt.htm',
        ],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/tzhb/index/tzgg1.htm'],
    };

    // 获取页面内容
    const response = await got(type_dict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.main_conR li')
        .toArray()
        .slice(0, 20)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), type_dict[type][1]).href;
            const title = $link.find('em').text().trim();

            // 获取发布时间
            const pubDateText = $element.find('span').text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });

    // 保留结构以便将来扩展，当前直接返回列表项
    const items = list.map((item) => item);

    return {
        title: `郑大党委统战部-${type_dict[type][0]}`,
        link: type_dict[type][1],
        item: items,
    };
}
