import { Data, Route, DataItem } from '@/types';
import { baseUrl } from './utils';

import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/dailySummary',
    example: '/visionias/dailySummary',
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
            source: ['visionias.in/current-affairs/upsc-daily-news-summary'],
            target: '/dailySummary',
        },
    ],
    name: 'Daily News Summary',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    const response = await ofetch(`${baseUrl}/current-affairs/upsc-daily-news-summary`);

    const items = processNews(response);

    return {
        title: 'Daily News Summary | Vision IAS',
        link: `${baseUrl}/current-affairs/upsc-daily-news-summary`,
        description:
            'Get concise and efficient summaries of key articles from prominent newspapers. Our daily news digest ensures quick reading and easy understanding, helping you stay informed about important events and developments without spending hours going through full articles. Perfect for focused and timely updates.',
        language: 'en',
        item: items,
        image: `${baseUrl}/current-affairs/images/news-today-logo.svg`,
        icon: `https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png`,
        logo: `https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png`,
        allowEmpty: true,
    };
}

function processNews(page) {
    const $ = load(page);
    const items = $(`#quiz-start div[x-data="{ isExpanded: false }"]`)
        .toArray()
        .map((item) => {
            const title = $(item).find('a>h5').text().trim();
            const content = $(item).find('a>div').html() ?? '';
            const link = $(item).find('div>p>a').attr('href') || '';
            return {
                title,
                link,
                guid: link,
                description: content,
            } as DataItem;
        });

    return items;
}
