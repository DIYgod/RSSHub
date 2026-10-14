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
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.max(1, Math.floor(requestedLimit)) : 1;
    const response = await ofetch(`${baseUrl}/current-affairs/weekly-focus/archive`);
    const $ = load(response);
    const cards = $('div.weekly-focus-single-card');
    const articleLinks = cards.length ? cards.slice(0, limit).find('a:has(p)') : $('a[href^="/current-affairs/weekly-focus/20"]').slice(0, limit);
    const individualLinks = articleLinks.toArray().flatMap((item) => {
        const href = $(item).attr('href');
        return href ? { link: new URL(href, baseUrl).href } : [];
    });
    const items = await pMap(individualLinks, ({ link }) => extractNews({ link }, 'main > div > div.flex > div.flex.w-full > div.w-full.mt-6'), { concurrency: 3, stopOnError: false });
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
