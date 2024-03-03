// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const url = 'https://www.zotero.org/support/changelog';
    const response = await got(url);
    const data = response.data;
    const $ = load(data);
    const list = $('h2');

    ctx.set('data', {
        title: 'Zotero - Version History',
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    let date = $(item)
                        .text()
                        .match(/\((.*)\)/);
                    date = Array.isArray(date) ? date[1] : null;
                    return {
                        title: item.text().trim(),
                        description: $('<div/>').append(item.nextUntil('h2').clone()).html(),
                        pubDate: date,
                        link: url + '#' + item.attr('id'),
                    };
                })
                .get(),
    });
};
