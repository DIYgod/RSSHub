// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const baseUrl = 'https://missav.com';
    const { data: response } = await got(`${baseUrl}/dm397/new`);
    const $ = load(response);

    const items = $('.grid .group')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.text-secondary');
            const poster = new URL(item.find('img').data('src'));
            poster.searchParams.set('class', 'normal');
            const video = item.find('video').data('src');
            return {
                title: title.text().trim(),
                link: title.attr('href'),
                description: art(path.join(__dirname, 'templates/preview.art'), {
                    poster: poster.href,
                    video,
                    type: video.split('.').pop(),
                }),
            };
        });

    ctx.set('data', {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        item: items,
    });
};
