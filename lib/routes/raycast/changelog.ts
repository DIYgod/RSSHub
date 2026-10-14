import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const handler: Route['handler'] = async () => {
    const item = await cache.tryGet('raycast:changelog:v3', async () => {
        const data = await ofetch('https://www.raycast.com/changelog');

        const $ = load(data);

        return $('article')
            .toArray()
            .map<DataItem>((item) => {
                const $item = $(item);

                const version = $item.find('span[id]').attr('id');
                const html = $item.find('div.markdown').html();
                const date = $item.find('span[class*=changelogDate]').text();

                return {
                    title: `Version ${version}`,
                    description: html,
                    link: new URL($item.find('a[href^="/changelog/"]').first().attr('href')!, 'https://www.raycast.com').href,
                    pubDate: date ? parseDate(`${date} +0000`, 'MMMM D, YYYY ZZ') : undefined,
                };
            });
    });

    return {
        title: 'Raycast Changelog',
        link: 'https://www.raycast.com/changelog',
        language: 'en-us',
        item,
    };
};

export const route: Route = {
    path: '/changelog',
    name: 'Changelog',
    categories: ['program-update'],
    example: '/raycast/changelog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
    maintainers: ['equt'],
};
