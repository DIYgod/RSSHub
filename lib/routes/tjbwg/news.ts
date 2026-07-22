import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

export const route: Route = {
    path: '/news',
    categories: ['travel'],
    example: '/tjbwg/news',
    name: 'News',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.tjbwg.cn/cn/NewsList.aspx'],
            target: '/news',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://www.tjbwg.cn';
        const listUrl = `${baseUrl}/cn/NewsList.aspx?TypeId=10926`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await ofetch(listUrl);
        const $ = load(response);

        const list = $('.newsList1 ul li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a');
                const href = a.attr('href') || '';
                const link = new URL(href, `${baseUrl}/cn/`).href;
                const title = a.find('h3').text();
                const dateText = a.find('.time').text().trim();

                return {
                    title,
                    link,
                    pubDate: parseDate(dateText),
                };
            });

        return {
            title: `${museumName} - 最新公告`,
            link: listUrl,
            language: 'zh-CN',
            item: list,
        };
    },
};
