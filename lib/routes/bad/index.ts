// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://bad.news';
    const currentUrl = `${rootUrl}${getSubPath(ctx) === '/' ? '' : getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.option, .pagination').remove();

    const items = $('.entry')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a.title');

            item.find('img').each(function () {
                $(this).attr('src', $(this).attr('data-echo'));
                $(this).removeClass('lazy');
                $(this).removeAttr('data-echo');
                $(this).removeAttr('id');
            });

            item.find('video').each(function () {
                $(this).attr('poster', $(this).attr('data-echo'));
                $(this).removeAttr('data-echo');
                $(this).removeAttr('onerror');
                $(this).removeAttr('id');
            });

            return {
                title: a.text(),
                link: a.attr('href'),
                description: item.find('.coverdiv').html(),
                author: item.find('.author').text().trim(),
                pubDate: timezone(parseDate(item.find('time').attr('datetime')), +8),
                category: item
                    .find('.label')
                    .toArray()
                    .map((l) => $(l).text().trim()),
            };
        });

    ctx.set('data', {
        title: `Bad.news - ${$('.active').text()}${$('.selected').text()}`,
        link: currentUrl,
        item: items,
    });
};
