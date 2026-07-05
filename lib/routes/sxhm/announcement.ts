import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

export const route: Route = {
    path: '/announcement',
    categories: ['travel'],
    example: '/sxhm/announcement',
    parameters: {},
    name: 'Announcements',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.sxhm.com/info/announcement.html'],
            target: '/announcement',
        },
    ],

    handler: async () => {
        const baseUrl = 'https://www.sxhm.com';
        const apiUrl = `${baseUrl}/info/announcement.html`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data);

        const items = $('.listwrap .list .li')
            .toArray()
            .map((el) => {
                const $item = $(el);
                const $a = $item.find('.ltit a');
                const title = $item.find('.ltit .t').text();
                const link = new URL($a.attr('href')!, baseUrl).href;

                const dateStr = $item.find('.lcont .date').text().trim();

                return {
                    title,
                    link,
                    pubDate: parseDate(dateStr),
                };
            });

        return {
            title: `${museumName} - 最新公告`,
            link: apiUrl,
            language: 'zh-CN',
            item: items as DataItem[],
        };
    },
};
