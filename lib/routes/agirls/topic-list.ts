// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl } = require('./utils');

export default async (ctx) => {
    const category = 'topic';
    const link = `${baseUrl}/${category}`;

    const response = await got(`${baseUrl}/${category}`);

    const $ = load(response.data);

    const items = $('.ag-topic')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.ag-topic__link').text().trim(),
                description: item.find('.ag-topic__summery').text().trim(),
                link: `${baseUrl}${item.find('.ag-topic__link').attr('href')}`,
            };
        });

    ctx.set('data', {
        title: $('head title').text().trim(),
        link,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    });
};
