import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

        const list = $('div.slide.wow.fadeInUp')
            .toArray()
            .filter((item) => $(item).find('a[href^="/newsinfo/"]'))
            .map((item): DataItem => {
                const $item = $(item);
                const a = $item.find('a[href^="/newsinfo/"]');
                const title = a.attr('title') ?? '';
                const link = new URL(a.attr('href')!, baseUrl).href;
                const dateRaw =
                    $item
                        .find('.c3')
                        .text()
                        .match(/\[(.+?)\]/)?.[1] || '';

                return {
                    title,
                    link,
                    pubDate: parseDate(dateRaw),
                };
            });

        return {
            title: `${museumName} - ${categoryName}`,
            link: listUrl,
            language: 'zh-CN',
            item: list,
        };
    },
};
