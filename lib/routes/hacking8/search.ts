// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const keyword = ctx.req.param('keyword') ?? '';

    const rootUrl = 'https://i.hacking8.com';
    const currentUrl = `${rootUrl}/search/?q=${keyword}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('div.media')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('div.link a');

            return {
                title: a.text(),
                link: new URL(a.attr('href'), rootUrl).href,
                description: item.find('div.media-body pre').text(),
                pubDate: timezone(parseDate(item.parent().parent().find('td').first().text(), 'YYYY年M月D日 HH:mm'), +8),
                category: item
                    .parent()
                    .parent()
                    .find('span.label')
                    .toArray()
                    .map((l) => $(l).text()),
            };
        });

    ctx.set('data', {
        title: `Hacking8 安全信息流 - ${$('title')
            .text()
            .replaceAll(/总数:\d+/g, '')
            .trim()}`,
        link: currentUrl,
        item: items,
    });
};
