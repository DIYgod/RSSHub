import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const HOME_PAGE = 'http://www.jlwater.com/';

export const route: Route = {
    path: '/nanjing',
    categories: ['forecast'],
    example: '/tingshuitz/nanjing',
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
            source: ['jlwater.com/portal/10000013', 'jlwater.com/'],
        },
    ],
    name: '南京市',
    maintainers: ['ocleo1'],
    handler,
    url: 'jlwater.com/portal/10000013',
};

async function handler() {
    const url = `${HOME_PAGE}portal/10000013`;
    const response = await got(url);

    const data = response.data;
    const $ = load(data);
    const list = $('.list-content ul li');

    return {
        title: $('head title').text(),
        link: url,
        item: list.toArray().map((item) => {
            const $item = $(item);
            const title = $item.find('a span').text();
            const link = $item.find('a').attr('href');
            const listTime = $item.find('.list-time').text();
            const pubDate = parseDate(listTime);
            return {
                title: `${title} ${listTime}`,
                description: '南京市停水通知',
                link: `${HOME_PAGE}${link}`,
                pubDate,
            };
        }),
    };
}
