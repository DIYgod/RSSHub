import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

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

        const list = $('.view-content .views-row')
            .toArray()
            .map((el) => {
                const $item = $(el);
                const $a = $item.find('.views-field-title-1 a');
                const title = $a.text();
                const href = $a.attr('href');
                const link = new URL(href!, baseUrl).href;
                const dateString = $item.find('.date-display-single').attr('content');
                const pubDate = dateString ? parseDateInTimezone(dateString, 8) : undefined;

                return {
                    title,
                    link,
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                };
            });

        const items = await pMap(
            list,
            async (item) => ({
                ...item,
                description: await cache.tryGet(`hnmuseum:news-body:${item.link}`, async () => {
                    const response = await got(item.link);
                    const article = load(response.data);
                    const description = article('.field-name-body .field-item').first().html();
                    if (!description?.trim()) {
                        throw new Error(`The museum news article has no main content: ${item.link}`);
                    }
                    return description;
                }),
            }),
            { concurrency: 3 }
        );

        return {
            title: `${museumName} - 湘博动态`,
            link: apiUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
