import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route: Route = {
    path: '/hnmnews',
    categories: ['travel'],
    example: '/hnmuseum/hnmnews',
    name: 'HNM News',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.hnmuseum.com/zh-hans/xiangbo_dongtai_news'],
            target: '/hnmnews',
        },
    ],

    handler: async () => {
        const baseUrl = 'https://www.hnmuseum.com';
        const apiUrl = `${baseUrl}/zh-hans/xiangbo_dongtai_news`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data);

        const items = $('.view-content .views-row')
            .toArray()
            .map((el) => {
                const $item = $(el);
                const $a = $item.find('.views-field-title-1 a');
                const title = $a.text();
                const href = $a.attr('href');
                const link = new URL(href!, baseUrl).href;
                const dateString = $item.find('.date-display-single').attr('content');

                return {
                    title,
                    link,
                    pubDate: timezone(parseDate(dateString!), 8),
                };
            });

        return {
            title: `${museumName} - 湘博动态`,
            link: apiUrl,
            language: 'zh-CN',
            item: items as DataItem[],
        };
    },
};
