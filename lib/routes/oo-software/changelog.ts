// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? 'shutup10';

    const rootUrl = 'https://www.oo-software.com';
    const currentUrl = `${rootUrl}/en/${id}/changelog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.content h4')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();

            return {
                title,
                link: `${currentUrl}#${title.split(' – ')[0]}`,
                description: item.next().html(),
                pubDate: parseDate(title.match(/released (on )?(.*)$/)[2], 'MMMM DD, YYYY'),
            };
        });

    items[0].enclosure_url = $('.banner-inlay').find('a').attr('href');

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
