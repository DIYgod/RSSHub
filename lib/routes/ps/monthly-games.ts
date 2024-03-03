// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import * as path from 'node:path';
import { art } from '@/utils/render';

export default async (ctx) => {
    const baseUrl = 'https://www.playstation.com/en-sg/ps-plus/whats-new/';

    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const list = $('.cmp-experiencefragment--your-latest-monthly-games .box')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                description: art(path.join(__dirname, 'templates/monthly-games.art'), {
                    img: item.find('.media-block__img source').attr('srcset'),
                    text: item.find('h3 + p').text(),
                }),
                link: item.find('.button a').attr('href'),
            };
        });

    ctx.set('data', {
        title: 'PlayStation Plus Monthly Games',
        link: baseUrl,
        item: list,
    });
};
