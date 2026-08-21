import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/jyc/:type?',
    categories: ['university'],
    example: '/xupt/jyc',
    parameters: { type: '分类，默认为 tzgg（通知公告）' },
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
            source: ['jyc.xupt.edu.cn/index/tzgg.htm'],
            target: '/jyc/tzgg',
        },
    ],
    name: '教务处通知公告',
    maintainers: ['StudyingLover'],
    handler,
    description: `| 分类     | 参数 |
| -------- | ---- |
| 通知公告 | tzgg |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'tzgg';
    const typeDict = {
        tzgg: ['通知公告', 'https://jyc.xupt.edu.cn/index/tzgg.htm'],
    };

    const [typeName, url] = typeDict[type as keyof typeof typeDict] || typeDict.tzgg;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.ej_list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a').first();

            // 处理相对链接，转换为绝对链接
            const linkHref = $link.attr('href') || '';
            const absoluteLink = new URL(linkHref, 'https://jyc.xupt.edu.cn').href;

            // 日期格式：<span><i>18</i>/03</span> - 只有月日，无年份
            // 根据规范，网站不提供完整日期时不添加 pubDate

            return {
                title: $link.text().trim(),
                link: absoluteLink,
            };
        })
        .filter((item) => item.title && item.link);

    return {
        title: `西安邮电大学教务处 - ${typeName}`,
        link: url,
        item: list,
    };
}
