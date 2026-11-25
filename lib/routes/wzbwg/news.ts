import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { namespace } from './namespace';

export const route: Route = {
    path: '/news/:type',
    categories: ['travel'],
    example: '/wzbwg/news/24',
    parameters: {
        type: 'News Type, supported values: 24（重要资讯）, 23（通知公告）, 25（工作动态）',
    },
    radar: [
        {
            source: ['www.wzbwg.com/news/:type'],
            target: '/news/:type',
        },
    ],
    name: '资讯',
    maintainers: ['magazian'],
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const baseUrl = 'https://www.wzbwg.com';
        const listUrl = `${baseUrl}/news/${type}`;
        const museumName = namespace.zh?.name || namespace.name;
        const response = await ofetch(listUrl);
        const $ = load(response);
        // use first() to avoid matching the repeat link
        const categoryName = $(`a[href="/news/${type}"]`).first().text();
        const list = $('div.slide.wow.fadeInUp a[href^="/newsinfo/"]')
            .toArray()
            .map((item) => {
                const a = $(item);
                const title = a.attr('title') ?? '';
                const link = new URL(a.attr('href')!, baseUrl).href;
                const dateRaw =
                    a
                        .find('.c3')
                        .text()
                        .match(/\[(.+?)\]/)?.[1] || '';
                return {
                    title,
                    link,
                    pubDate: parseDate(dateRaw, 8),
                };
            });
        const items = await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(item.link, async () => {
                    const article = await ofetch(item.link);
                    const $detail = load(article);
                    return { description: $detail('.info .txt').html() };
                });
                return { ...item, ...detail };
            },
            { concurrency: 3 }
        );
        return {
            title: `${museumName} - ${categoryName}`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
