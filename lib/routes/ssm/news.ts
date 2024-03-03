// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';
import { art } from '@/utils/render';

const rootUrl = `https://www.ssm.gov.mo`;
const newsUrl = `${rootUrl}/apps1/content/ch/973/itemlist.aspx?defaultcss=false&dlimit=20&showdate=true&dorder=cridate%20desc,displaydate%20desc&withattach=true`;

export default async (ctx) => {
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

    ctx.set('data', {
        title: '澳门卫生局-最新消息',
        link: rootUrl,
        item,
    });
};
