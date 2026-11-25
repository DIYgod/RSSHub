import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/naturalism',
    radar: [
        {
            source: ['naturalism.org'],
        },
    ],
    name: "What's New",
    maintainers: ['TonyRL'],
    handler,
    url: 'naturalism.org',
};

async function handler() {
    const baseUrl = 'https://naturalism.org';
    const response = await ofetch(baseUrl);
    const $ = load(response);

    const list = $('.view-what-s-new .field-content a')
        .toArray()
        .map((element): DataItem => {
            const a = $(element);
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`naturalism:article:v2:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('#content');
                content.find('h1').remove();

                return { description: content.html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link: baseUrl,
        image: `${baseUrl}/sites/naturalism.org/files/swirl-logo.png`,
        item: items,
    };
}
