import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

import { baseUrl, extractNews } from './utils';

export const route: Route = {
    path: '/newsToday/:filter?',
    example: '/visionias/newsToday',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    parameters: {
        filter: {
            description: 'Period to fetch news for the current month. All news for the current month or only the latest',
            default: 'latest',
            options: [
                { value: 'all', label: 'All' },
                { value: 'latest', label: 'Latest' },
            ],
        },
    },
    radar: [
        {
            source: ['visionias.in/current-affairs/news-today'],
            target: '/newsToday',
        },
    ],
    name: 'News Today',
    maintainers: ['Rjnishant530'],
    handler,
};
async function handler(ctx): Promise<Data> {
    const filter = ctx.req.param('filter') ?? 'latest';
    const now = Temporal.Now.zonedDateTimeISO('UTC');
    const currentYear = now.year;
    const currentMonth = now.month;
    logger.debug(`Getting news for month ${currentMonth} and year ${currentYear}`);
    const response = await ofetch<
        Array<{
            url: string;
        }>
    >(`${baseUrl}/current-affairs/news-today/getbymonth?year=${currentYear}&month=${currentMonth}`);
    let items: DataItem[] = [];
    if (response.length !== 0) {
        if (filter === 'latest') {
            const currentUrl = response[0].url;
            items = await processCurrentNews(currentUrl);
        } else {
            const results = await pMap(response, (element) => processCurrentNews(element.url), { concurrency: 1, stopOnError: false });
            items.push(...results.flat());
        }
    }
    return {
        title: 'News Today | Current Affairs | Vision IAS',
        link: `${baseUrl}/current-affairs/news-today/archive`,
        description: 'News Today is a daily bulletin providing readers with a comprehensive overview of news developments, news types, and technical terms.',
        language: 'en',
        item: items,
        image: `${baseUrl}/current-affairs/images/news-today-logo.svg`,
        icon: 'https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png',
        logo: 'https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png',
    };
}
async function processCurrentNews(currentUrl: string) {
    const response = await ofetch(new URL(currentUrl, baseUrl).href);
    const $ = load(response);
    const links = $('#table-of-content > ul > li > a')
        .toArray()
        .map((item) => new URL(item.attribs.href, baseUrl).href);
    const news = await pMap(links, (link) => extractNews(link), { concurrency: 3, stopOnError: false });
    return news.flat();
}
