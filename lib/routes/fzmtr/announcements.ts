import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/announcements',
    categories: ['travel'],
    example: '/fzmtr/announcements',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '通知公告',
    maintainers: ['HankChow'],
    handler,
};

async function handler() {
    const domain = 'www.fzmtr.com';
    const announcementsUrl = `http://${domain}/html/fzdt/tzgg/index.html`;
    const response = await got(announcementsUrl);
    const data = response.data;

    const $ = load(data);
    const list = $('span#resources li')
        .toArray()
        .map((item) => {
            item = $(item);
            const url = `http://${domain}` + item.find('a').attr('href');
            const title = item.find('a').text();
            const publishTime = parseDate(item.find('span').text());
            return {
                title,
                link: url,
                author: '福州地铁',
                pubtime: publishTime,
            };
        });

    return {
        title: '福州地铁通知公告',
        url: announcementsUrl,
        description: '福州地铁通知公告',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    };
}
