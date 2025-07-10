import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseUrl } from './utils';

export const route: Route = {
    path: '/topic_list',
    categories: ['new-media'],
    example: '/agirls/topic_list',
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
            source: ['agirls.aotter.net/', 'agirls.aotter.net/topic'],
        },
    ],
    name: '当前精选主题列表',
    maintainers: ['TonyRL'],
    handler,
    url: 'agirls.aotter.net/',
};

async function handler() {
    const category = 'topic';
    const link = `${baseUrl}/${category}`;

    const response = await got(`${baseUrl}/${category}`);

    const $ = load(response.data);

    const items = $('.ag-topic')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.ag-topic__link').text().trim(),
                description: item.find('.ag-topic__summery').text().trim(),
                link: `${baseUrl}${item.find('.ag-topic__link').attr('href')}`,
            };
        });

    return {
        title: $('head title').text().trim(),
        link,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };
}
