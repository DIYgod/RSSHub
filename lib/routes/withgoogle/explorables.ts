import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    name: 'PAIR - AI Exploreables',
    url: 'pair.withgoogle.com/explorables',
    path: '/explorables',
    maintainers: ['cesaryuan'],
    example: '/withgoogle/explorables',
    categories: ['blog'],
    radar: [
        {
            source: ['pair.withgoogle.com/explorables'],
            target: '',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://pair.withgoogle.com';
        const response = await ofetch(baseUrl + '/explorables', {
            method: 'GET',
        });
        const $ = load(response);
        const items = await Promise.all(
            $('div.explorable-card')
                .toArray()
                .map(async (el) => {
                    const title = $(el).find('h3').text();
                    const image = $(el).find('img').attr('src');
                    const link = baseUrl + $(el).find('a').attr('href');
                    return (await cache.tryGet(link, async () => {
                        const response = await ofetch(link);
                        const $item = load(response);
                        let description = $item('body').html();
                        if (!description || description.trim() === '') {
                            description = $('p').text();
                        }
                        return {
                            title,
                            link,
                            description,
                            image,
                        };
                    })) as DataItem;
                })
        );
        return {
            title: 'PAIR - AI Exploreables',
            link: 'https://pair.withgoogle.com/explorables',
            item: items,
        };
    },
};
