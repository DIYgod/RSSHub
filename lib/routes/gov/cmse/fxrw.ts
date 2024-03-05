// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const rootUrl = 'http://www.cmse.gov.cn';
    const currentUrl = `${rootUrl}/fxrw/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('#list li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title').text().split('：').pop().trim(),
                link: new URL(item.attr('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.find('.infoR').first().text().trim(), 'YYYY年M月D日H时m分'), +8),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: new URL(item.find('img').attr('src'), currentUrl).href,
                    description: item.find('.info').html(),
                }),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
