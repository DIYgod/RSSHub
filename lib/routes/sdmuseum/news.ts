import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

export const route: Route = {
    path: '/news',
    categories: ['travel'],
    example: '/sdmuseum/news',
    parameters: {},
    name: 'News',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.sdmuseum.com/col/col270324/index.html'],
            target: '/news',
        },
    ],

    handler: async () => {
        const baseUrl = 'https://www.sdmuseum.com';
        const apiUrl = `${baseUrl}/col/col270324/index.html`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });
        const $ = load(response.data, {
            xml: true,
        });

        const items = $('record')
            .toArray()
            .map((el) => {
                const itemHtml = $(el).text();
                const $item = load(itemHtml);

                const $a = $item('.ltit a');
                const title = $a.attr('title');
                const link = new URL($a.attr('href')!, baseUrl).href;

                // date format 2026.06.03
                const dateStr = $item('.data.av').text().trim();

                return {
                    title,
                    link,
                    pubDate: parseDate(dateStr),
                };
            });

        return {
            title: `${museumName} - 公告`,
            link: apiUrl,
            language: 'zh-CN',
            item: items as DataItem[],
        };
    },
};
