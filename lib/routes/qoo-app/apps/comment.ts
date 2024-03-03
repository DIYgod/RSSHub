// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { appsUrl } = require('../utils');
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { id, lang = '' } = ctx.req.param();
    const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-comment/${id}`;

    const { data: response } = await got(link, {
        searchParams: {
            sort: 'create',
        },
    });
    const $ = load(response);

    const items = $('.qoo-post-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const author = item.find('.qoo-clearfix .name a').eq(0).text();
            return {
                title: `${author} ▶ ${item.find('.qoo-clearfix .name a').eq(1).text()}`,
                link: item.find('a.bg-click-wrap').attr('href'),
                description: art(path.join(__dirname, '../templates/comment.art'), {
                    rating: item.find('.qoo-rating-bar').text().trim(),
                    text: item.find('.text-view').html(),
                }),
                pubDate: timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm:ss'), 8),
                author,
            };
        });

    ctx.set('data', {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    });
};
