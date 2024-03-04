// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://getquicker.net';
    const currentUrl = `${rootUrl}/Help/Versions`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.version')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2 a');

            return {
                title: a.text().trim(),
                link: `${rootUrl}${a.attr('href')}`,
                description: item.find('.article-content').html(),
                pubDate: parseDate(item.find('.text-secondary').first().text()),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
