import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const typeMap = {
    dynamic: '协会动态',
    announcement: '通知公告',
    industry: '行业动态',
};

export const route: Route = {
    path: '/:type',
    categories: ['government'],
    example: '/sara/announcement',
    parameters: { type: 'dynamic | announcement | industry' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `| 协会动态 | 通知公告 |行业动态 |
| -------- | ------------ | -------- |
| dynamic | announcement | industry |`,

    name: '新闻资讯',
    maintainers: ['HChenZi'],
    handler: async (ctx) => {
        const baseUrl = 'http://www.sara.org.cn';
        const type = ctx.req.param('type');

        const url = `${baseUrl}/news/${type}.htm`;
        const response = await ofetch(url);
        const $ = load(response);
        const list = $('.newsItem_total > dd')
            .toArray()
            .map((item) => {
                const a = $(item).find('a').first();
                return {
                    link: `${baseUrl}${a.attr('href')}`,
                    title: a.attr('title'),
                };
            });
        const items = (await Promise.all(list.map((elem) => getFeedItem(elem)))) as DataItem[];
        return {
            title: typeMap[type],
            link: url,
            item: items,
        };
    },
};

async function getFeedItem(item) {
    return await cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        return {
            description: $('.text').html(),
            language: 'zh-cn',
            ...item,
        };
    });
}
