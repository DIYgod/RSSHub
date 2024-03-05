// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://bandcamp.com';
    const currentUrl = `${rootUrl}/live_schedule`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.curated-wrapper').remove();

    const items = $('.live-listing')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.find('.title-link').attr('href'),
                title: item.find('.show-title').text(),
                author: item.find('.show-artist').text(),
                pubDate: parseDate(item.find('.show-time-container').text().trim().split(' UTC')[0]),
                description: `<img src="${
                    item
                        .find('.show-thumb-image')
                        .attr('style')
                        .match(/background-image: url\((.*)\);/)[1]
                }">`,
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
