import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { baseUrl, extractNews } from './utils';

export const route: Route = {
    path: '/monthlyMagazine',
    example: '/visionias/monthlyMagazine',
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
            source: ['visionias.in/current-affairs/monthly-magazine'],
            target: '/monthlyMagazine',
        },
    ],
    name: 'Monthly Magazine',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    const response = await ofetch(`${baseUrl}/current-affairs/monthly-magazine`);

    const items = await processNews(response);

    return {
        title: 'Monthly Magazine | Vision IAS',
        link: `${baseUrl}/current-affairs/monthly-magazine`,
        description:
            'Monthly Magazine from Vision IAS provides a comprehensive overview of current affairs, covering significant events and developments across various sectors. It is designed to help aspirants stay updated with the latest happenings, enhancing their preparation for competitive exams.',
        language: 'en',
        item: items,
        image: `${baseUrl}/current-affairs/images/news-today-logo.svg`,
        icon: 'https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png',
        logo: 'https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png',
    };
}

async function processNews(page) {
    const $ = load(page);
    const links = $('#monthly-table-of-content>div div>ul>li a')
        .toArray()
        .map((a) => new URL(a.attribs.href, baseUrl).href);
    const news = await pMap(links, (link) => extractNews(link), { concurrency: 3, stopOnError: false });

    return news.flat();
}
