import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
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
    const divItems = $('#monthly-table-of-content>div').toArray();
    const linkItems = divItems.flatMap((item) => {
        const mainTitle = $(item).find('button>div:nth-child(2) div.text-left').text();
        return $(item)
            .find('div>ul>li')
            .toArray()
            .map((li) => {
                const itemTitle = $(li).find('a').text();
                const link = $(li).find('a').attr('href');
                if (!link) {
                    throw new NotFoundError('The VisionIAS monthly listing does not provide a link');
                }
                return {
                    title: `${itemTitle} - ${mainTitle}`,
                    link: new URL(link, baseUrl).href,
                };
            });
    });
    const news = await pMap(linkItems, (item) => extractNews(item, 'main > div > div.flex.flex-col> div.flex.flex-col.w-full.mt-10'), { concurrency: 3, stopOnError: false });

    return news.flat();
}
