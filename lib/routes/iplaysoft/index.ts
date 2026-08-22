import { load } from 'cheerio'; // html parser

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const handler = async (ctx): Promise<Data> => {
    const feed = await parser.parseURL('https://feed.iplaysoft.com');
    const limit = Number(ctx.req.query('limit') || '20');

    const filteredItems = feed.items
        .map((item) => (item.title && item.link && item.pubDate && /.*\.iplaysoft\.com$/.test(new URL(item.link).hostname) ? { ...item, title: item.title, link: item.link, pubDate: item.pubDate } : null))
        .filter((item) => item !== null)
        .slice(0, limit);

    const items = await Promise.all(
        filteredItems.map((item) =>
            cache.tryGet(item.link, async (): Promise<DataItem> => {
                const response = await ofetch(item.link);
                const $ = load(response);

                $('.entry-content').find('div[style*="overflow:hidden"]').remove();

                return {
                    title: item.title,
                    description: $('.entry-content').html(),
                    link: item.link,
                    author: item.author,
                    pubDate: parseDate(item.pubDate),
                };
            })
        )
    );

    return {
        title: '异次元软件世界',
        description: '软件改变生活',
        language: 'zh-CN',
        link: 'https://www.iplaysoft.com',
        item: items,
    };
};

export const route: Route = {
    path: '/',
    name: '首页',
    url: 'www.iplaysoft.com',
    maintainers: ['kimi360', 'williamgateszhao', 'cscnk52', 'LokHsu'],
    handler,
    example: '/iplaysoft',
    parameters: {},
    categories: ['program-update'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.iplaysoft.com'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
