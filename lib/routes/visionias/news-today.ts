import { load } from 'cheerio';
import dayjs from 'dayjs';

import type { Data, Route } from '@/types';
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
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;
    logger.debug(`Getting news for month ${currentMonth} and year ${currentYear}`);
    const response = await ofetch(`${baseUrl}/current-affairs/news-today/getbymonth?year=${currentYear}&month=${currentMonth}`);

    let items: any = [];
    // let title = 'News Today';

    if (response.length !== 0) {
        if (filter === 'latest') {
            const currentUrl = response[0].url;
            // title = response[0].formatted_published_at;
            items = await processCurrentNews(currentUrl);
        } else {
            const results = await Promise.all(response.map((element) => processCurrentNews(element.url)));
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
        icon: `https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png`,
        logo: `https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png`,
        allowEmpty: true,
    };
}

async function processCurrentNews(currentUrl) {
    const response = await ofetch(`${baseUrl}${currentUrl}`);
    const $ = load(response);
    const items = $(`#table-of-content > ul > li > a`)
        .toArray()
        .map((item) => {
            const link = $(item).attr('href');
            const title = $(item).clone().children('span').remove().end().text().trim();
            return {
                title,
                link: title === 'Also in News' ? link : `${baseUrl}${link}`,
                guid: link,
            };
        });
    const newsPromises = await Promise.allSettled(items.map((item) => extractNews(item, 'main > div > div.mt-6 > div.flex > div.flex.mt-6')));
    return newsPromises.flatMap((news) => (news.status === 'fulfilled' ? (Array.isArray(news.value) ? news.value : [news.value]) : [{ title: 'Error Parse News' }]));
}
