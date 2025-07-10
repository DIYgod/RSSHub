import { Data, Route } from '@/types';
import { baseUrl, extractNews } from './utils';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

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
            source: ['visionias.in/current-affairs/weekly-focus'],
            target: '/weeklyFocus',
        },
    ],
    name: 'Weekly Focus',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 1;
    const response = await ofetch(`${baseUrl}/current-affairs/weekly-focus/archive`);
    const $ = load(response);
    const cards = $('div.weekly-focus-single-card').slice(0, limit).toArray();
    const individualLinks = cards.flatMap((card) =>
        $(card)
            .find('a:has(p)')
            .toArray()
            .map((item) => {
                const link = $(item).attr('href');
                return { link: link?.startsWith('http') ? link : `${baseUrl}${link}` };
            })
    );

    const itemsPromise = await Promise.allSettled(individualLinks.map(({ link }) => extractNews({ link }, 'main > div > div.flex > div.flex.w-full > div.w-full.mt-6')));

    return {
        title: 'Weekly Focus | Current Affairs | Vision IAS',
        link: `${baseUrl}/current-affairs/weekly-focus/archive`,
        description: 'Weekly Focus provides weekly comprehensive analysis of current themes with multidimensional and consolidated content.',
        language: 'en',
        item: itemsPromise.map((item) => (item.status === 'fulfilled' ? item.value : { title: 'Error Parse News' })),
        image: `${baseUrl}/current-affairs/images/weekly-focus-logo.svg`,
        icon: `https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png`,
        logo: `https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png`,
        allowEmpty: true,
    };
}
