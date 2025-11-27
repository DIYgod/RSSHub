import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/bullets',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/finology/bullets',
    parameters: {},
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
            source: ['insider.finology.in/bullets'],
        },
    ],
    name: 'Bullets',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'insider.finology.in/bullets',
};

async function handler() {
    const baseUrl = 'https://insider.finology.in/bullets';

    const response = await ofetch(baseUrl);
    const $ = load(response);

    const listItems = $('body > div.flex.bullettext > div.w80 > div')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const time = $item.find('div.timeline-info span').text().split(', ')[1];
            const a = $item.find('a.timeline-title');
            const description = $item.find('div.bullet-desc').html();
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(time),
                description,
            };
        });

    return {
        title: 'Finology Insider Bullets',
        link: baseUrl,
        item: listItems,
        description: 'Your daily dose of crisp, spicy financial news in 80 words.',
        logo: 'https://insider.finology.in/Images/favicon/favicon.ico',
        icon: 'https://insider.finology.in/Images/favicon/favicon.ico',
        language: 'en-us',
    } as Data;
}
