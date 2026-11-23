import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { baseUrl, extractNews } from './utils';

export const route: Route = {
    path: '/weeklyFocus',
    example: '/visionias/weeklyFocus',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['visionias.in/current-affairs/weekly-focus', 'visionias.in/current-affairs/weekly-focus/archive'],
            target: '/weeklyFocus',
        },
    ],
    name: 'Weekly Focus',
    maintainers: ['Rjnishant530'],
    handler,
};
async function handler(ctx): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 1;
    const response = await ofetch(`${baseUrl}/current-affairs/weekly-focus/archive`);
    const $ = load(response);
    const links = $('.space-y-4 a[href^="/current-affairs/weekly-focus/20"]')
        .slice(0, limit)
        .toArray()
        .map((item) => `${baseUrl}${item.attribs.href}`);
    const items = await pMap(links, (link) => extractNews(link), { concurrency: 3, stopOnError: false });
    return {
        title: 'Weekly Focus | Current Affairs | Vision IAS',
        link: `${baseUrl}/current-affairs/weekly-focus/archive`,
        description: 'Weekly Focus provides weekly comprehensive analysis of current themes with multidimensional and consolidated content.',
        language: 'en',
        item: items.flat(),
        image: `${baseUrl}/current-affairs/images/weekly-focus-logo.svg`,
        icon: 'https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png',
        logo: 'https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png',
    };
}
