import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route: Route = {
    path: '/information',
    categories: ['travel'],
    example: '/gdmuseum/information',
    name: 'Information',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.gdmuseum.org.cn/cn/col51/list'],
            target: '/information',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://www.gdmuseum.org.cn';
        const apiUrl = `${baseUrl}/cn/col51/list`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got(apiUrl);
        const $ = load(response.data);

        const list = $('.ULLIST li a[href^="/cn/col"]')
            .toArray()
            .map((el) => {
                const $item = $(el);

                const rawLink = $item.attr('href') || '';
                const itemLink = new URL(rawLink, baseUrl).href;

                const title = $item.find('h3.h3.qui-dot').text();
                const day = $item.find('time b').text().trim();
                const yearMonth = $item.find('time i').text().trim();

                const pubDate = timezone(parseDate(`${yearMonth}-${day}`), 8);

                return {
                    title,
                    link: itemLink,
                    pubDate,
                } as DataItem;
            });

        return {
            title: `${museumName} - 公告`,
            link: apiUrl,
            language: 'zh-CN',
            item: list,
        };
    },
};
