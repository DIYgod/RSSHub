import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import { art } from '@/utils/render';

const rootUrl = `https://www.ssm.gov.mo`;
const newsUrl = `${rootUrl}/apps1/content/ch/973/itemlist.aspx?defaultcss=false&dlimit=20&showdate=true&dorder=cridate%20desc,displaydate%20desc&withattach=true`;

export const route: Route = {
    path: '/news',
    categories: ['government'],
    example: '/ssm/news',
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
            source: ['www.ssm.gov.mo/', 'www.ssm.gov.mo/portal'],
        },
    ],
    name: '最新消息',
    maintainers: ['Fatpandac'],
    handler,
    url: 'www.ssm.gov.mo/',
};

async function handler() {
    const response = await got.get(newsUrl);
    const $ = load(response.data);
    const list = $('body > div > div > ul > li');

    const item = list
        .map((_, item) => {
            const title = $(item).find('a').text();
            const link = $(item).find('a').attr('href');
            const pubDate = parseDate($(item).find('small').text().split(':')[1].trim(), 'DD/MM/YYYY');
            const desc = art(path.join(__dirname, 'templates/news.art'), {
                link,
            });

            return {
                title,
                link,
                description: desc,
                pubDate,
            };
        })
        .get();

    return {
        title: '澳门卫生局-最新消息',
        link: rootUrl,
        item,
    };
}
