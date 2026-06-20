import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/flashcat/blog',
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
            source: ['flashcat.cloud/blog'],
            target: '/blog',
        },
    ],
    name: '快猫星云博客',
    maintainers: ['chesha1'],
    handler: handlerRoute,
};

async function handlerRoute(): Promise<Data> {
    const baseUrl = 'https://flashcat.cloud';
    const link = `${baseUrl}/blog/`;
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.fc-content-card')
        .toArray()
        .map((elem) => {
            const $item = $(elem);
            const [author, date] = $item
                .find('.fc-content-card-meta')
                .text()
                .split('·')
                .map((s) => s.trim());
            return {
                title: $item.find('.fc-content-card-title').text(),
                description: $item.find('.fc-content-card-summary').text().trim(),
                link: new URL($item.find('.fc-content-card-link').attr('href')!, baseUrl).href,
                pubDate: date ? parseDate(date, 'YYYY-MM-DD') : undefined,
                author,
            };
        });

    return {
        title: 'Flashcat 快猫星云博客',
        link,
        item: items,
    };
}
