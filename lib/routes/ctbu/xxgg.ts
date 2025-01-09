import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseURL = 'https://www.ctbu.edu.cn/index/xxgg.htm';

export const route: Route = {
    path: '/xxgg',
    categories: ['university'],
    example: '/ctbu/xxgg',
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
            source: ['www.ctbu.edu.cn/', 'www.ctbu.edu.cn/index/xxgg.htm'],
        },
    ],
    name: '学校公告',
    maintainers: ['Skylwn'],
    handler,
    url: 'www.ctbu.edu.cn/',
};

async function handler() {
    const response = await got(baseURL);
    const $ = load(response.data);
    const items = $('li.clearfix')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                description: item.find('p').text(),
                pubDate: parseDate(item.find('h6').text() + '-' + item.find('em').text(), 'YYYY-MM-DD'),
                link: item.find('a').attr('href'),
            };
        });
    return {
        title: $('title').text(),
        link: baseURL,
        item: items,
    };
}
