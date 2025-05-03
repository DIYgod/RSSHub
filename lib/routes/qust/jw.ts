import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const baseUrl = 'https://jw.qust.edu.cn/';

export const route: Route = {
    path: '/jw',
    categories: ['university'],
    example: '/qust/jw',
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
            source: ['jw.qust.edu.cn/jwtz.htm', 'jw.qust.edu.cn/'],
        },
    ],
    name: '教务通知',
    maintainers: ['Silent-wqh'],
    handler,
    url: 'jw.qust.edu.cn/jwtz.htm',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: `${baseUrl}jwtz.htm`,
    });
    const $ = load(response.data);
    const items = $('.winstyle60982 tr a.c60982')
        .toArray()
        .map((element) => {
            const linkElement = $(element);
            const itemTitle = linkElement.text().trim();
            const path = linkElement.attr('href');
            const itemUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;
            return {
                title: itemTitle,
                link: itemUrl,
            };
        });

    return {
        title: '青岛科技大学 - 教务通知',
        link: `${baseUrl}jwtz.htm`,
        item: items,
    };
}
