import type { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.grs.zju.edu.cn';
const listUrl = `${baseUrl}/yjszs/28498/list.htm`;

export const route: Route = {
    path: '/grs/yjszs',
    categories: ['university'],
    example: '/zju/grs/yjszs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院 - 研究生招生通知',
    maintainers: ['heikuisey'],
    handler,
    description: '浙江大学研究生院招生通知',
};

async function handler() {
    const res = await got(listUrl);
    const $ = load(res.data);
    const items = $('.common-news-list li')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const a = $el.find('a');
            const title = a.attr('title') || a.text().trim();
            let link = a.attr('href') || '';
            if (link && !link.startsWith('http')) {
                link = baseUrl + (link.startsWith('/') ? link : '/' + link);
            }
            const pubDate = parseDate($el.find('.date').text().trim());
            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((item) => item.title && item.link);

    return {
        title: '浙江大学研招网 - 研究生招生通知',
        link: listUrl,
        item: items,
    };
}
