import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const handler: Route['handler'] = async () => {
    const item = (await cache.tryGet('raycast:changelog', async () => {
        const data = await ofetch('https://www.raycast.com/changelog');

        const $ = load(data);

        return $('article')
            .toArray()
            .map<DataItem>((item) => {
                const $ = load(item);

                const version = $('span[id]').attr('id');
                const html = $('div.markdown').html() ?? '';
                const date = $('span[class^=ChangelogEntry_changelogDate]').text().trim();

                return {
                    title: `Version ${version}`,
                    description: html,
                    link: `https://www.raycast.com/changelog/${version?.replaceAll('.', '-')}`,
                    pubDate: parseDate(date),
                };
            });
    })) as DataItem[];

    return {
        title: 'Raycast Changelog',
        link: 'https://www.raycast.com/changelog',
        language: 'en-US',
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
