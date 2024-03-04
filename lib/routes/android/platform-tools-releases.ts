// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://developer.android.com';
    const currentUrl = `${rootUrl}/studio/releases/platform-tools`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            cookie: 'signin=autosignin',
        },
    });

    const $ = load(response.data);

    $('.hide-from-toc').remove();
    $('.devsite-dialog, .devsite-badge-awarder, .devsite-hats-survey').remove();

    const items = $('h4')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.attr('data-text');

            let description = '';
            item.nextUntil('h4').each(function () {
                description += $(this).html();
            });

            return {
                title,
                description,
                link: `${currentUrl}#${item.attr('id')}`,
                pubDate: parseDate(title.match(/\((.*)\)/)[1], 'MMMM YYYY'),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
