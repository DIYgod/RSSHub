import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/express-news',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/fastbull/express-news',
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
            source: ['fastbull.com/express-news', 'fastbull.com/'],
        },
    ],
    name: 'News Flash',
    maintainers: ['nczitzk'],
    handler,
    url: 'fastbull.com/express-news',
};

async function handler() {
    const rootUrl = 'https://www.fastbull.com';
    const currentUrl = `${rootUrl}/express-news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.news-list')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title_name').text(),
                pubDate: parseDate(Number.parseInt(item.attr('data-date'))),
                link: `${rootUrl}${item.find('.title_name').attr('href')}`,
            };
        });

    return {
        title: '实时财经快讯 - FastBull',
        link: currentUrl,
        item: items,
    };
}
