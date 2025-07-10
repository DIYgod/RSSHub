import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/aia/notice/:type?', '/auto/notice/:type?'],
    categories: ['university'],
    example: '/hust/aia/notice',
    parameters: { type: '分区，默认为最新通知，可在网页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '人工智能和自动化学院通知',
    maintainers: ['budui'],
    handler,
    description: `| 最新 | 党政 | 科研 | 本科生 | 研究生 | 学工思政 | 离退休 |
| ---- | ---- | ---- | ------ | ------ | -------- | ------ |
|      | dz   | ky   | bk     | yjs    | xgsz     | litui  |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const baseUrl = 'https://aia.hust.edu.cn';
    const link = `${baseUrl}/tzgg${type ? `/${type}` : ''}.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.list li');
    const title = $('title').text();

    return {
        title,
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a h2').text(),
                    description: item.find('a div').text() || title,
                    pubDate: parseDate(item.find('.date3').text(), 'DDYYYY-MM'),
                    link: new URL(item.find('a').attr('href'), link).href,
                };
            }),
    };
}
