import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
const baseUrl = 'https://www.ncwu.edu.cn/xxtz.htm';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/ncwu/notice',
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
            source: ['ncwu.edu.cn/xxtz.htm'],
        },
    ],
    name: '学校通知',
    maintainers: [],
    handler,
    url: 'ncwu.edu.cn/xxtz.htm',
};

async function handler() {
    const response = await got(baseUrl);

    const $ = load(response.data);
    const list = $('div.news-item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: `「` + item.find('a.dw').text() + `」` + item.find('a.dw').next().text(),
                description: item.find('div.detail').text(),
                pubDate: parseDate(item.find('div.month').text() + '-' + item.find('div.day').text(), 'YYYY-MM-DD'),
                link: item.find('a.dw').next().attr('href'),
            };
        });

    return {
        title: $('title').text(),
        link: baseUrl,
        item: list,
    };
}
