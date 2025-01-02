import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['program-update'],
    example: '/brave/latest',
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
            source: ['brave.com/latest', 'brave.com/'],
        },
    ],
    name: 'Release Notes',
    maintainers: ['nczitzk'],
    handler,
    url: 'brave.com/latest',
};

async function handler() {
    const rootUrl = 'https://brave.com';
    const currentUrl = `${rootUrl}/latest`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.box h3')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();
            const device = item.parent().find('h2').text();
            const matchVersion = title.match(/(v[\d.]+)/);
            const matchDate = title.match(/\((.*?)\)/);

            return {
                title: `[${device}] ${title}`,
                link: currentUrl,
                guid: `${currentUrl}#${device}-${matchVersion?.[1] ?? title}`,
                description: item.next().html(),
                pubDate: parseDate(matchDate?.[1].replace(/(st|nd|rd|th)?,/, ''), ['MMMM D YYYY', 'MMM D YYYY']),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
