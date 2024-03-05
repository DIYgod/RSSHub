// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { rootUrl } = require('./utils');

export default async (ctx) => {
    const response = await got(rootUrl + '/changelog');
    const $ = load(response.data);
    const items = $('div[class^=changelog-entry]')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h2').text(),
                link: rootUrl + item.find('a').attr('href'),
                description: item.find('div[class^=content-docs]').html(),
                pubDate: parseDate(item.find('a[class*=mb-xx-small]').text()),
                author: item
                    .find('span[class^=flex-shrink-0]')
                    .eq(0)
                    .find('img')
                    .toArray()
                    .map((e) => $(e).attr('alt').replace('Avatar of ', ''))
                    .join(', '),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: rootUrl + '/changelog',
        description: $('meta[name="description"]').attr('content'),
        language: 'en-US',
        item: items,
    });
};
