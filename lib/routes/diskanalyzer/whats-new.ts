// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://diskanalyzer.com';
    const currentUrl = `${rootUrl}/whats-new`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.blog-content h4')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();

            let description = '';
            item.nextUntil('h4').each(function () {
                description += $(this).html();
            });
            if (description === '') {
                item.parent()
                    .nextUntil('h4')
                    .each(function () {
                        description += $(this).html();
                    });
            }

            return {
                title,
                link: currentUrl,
                description,
                pubDate: parseDate(title.match(/\((.*)\)/)[1], ['D MMMM YYYY', 'D MMM YYYY']),
                guid: title,
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
