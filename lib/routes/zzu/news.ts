import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/news/:type',
    categories: ['university'],
    example: '/zzu/news/ywsd',
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
            source: ['news.zzu.edu.cn/'],
        },
    ],
    name: '郑大新闻网',
    maintainers: ['amandus1990'],
    handler,
    description: `| 要闻速递 | 教学科研 | 基层动态 | 媒体郑大 |
| -------- | -------- | -------- | -------- |
| ywsd     | jxky     | jcdt     | mtzd     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        ywsd: [
            '要闻速递', // 分类名称
            'https://news.zzu.edu.cn/ywsd.htm', // 郑大新闻网链接
        ],
        jxky: ['教学科研', 'https://news.zzu.edu.cn/jxky.htm'],
        jcdt: ['基层动态', 'https://news.zzu.edu.cn/jcdt.htm'],
        mtzd: ['媒体郑大', 'https://news.zzu.edu.cn/mtzd.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.new-item')
        .toArray()
        .slice(0, 15)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('h3 a').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.attr('title') || $link.text().trim();

            // 尝试获取发布时间
            const pubDateText = $element.find('.new-date').text().trim();

            // 尝试获取描述
            const description = $element.find('p a').text().trim() || '';

            return {
                title,
                link,
                description,
                pubDate: pubDateText || null,
            };
        });

    return {
        title: `郑大新闻网-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
