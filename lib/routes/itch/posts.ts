// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const topic = ctx.req.param('topic');
    const id = ctx.req.param('id');

    const rootUrl = 'https://itch.io';
    const currentUrl = `${rootUrl}/t/${topic}/${id}?before=999999999`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.post_grid')
        .toArray()
        .map((item) => {
            item = $(item);

            const author = item.find('.post_author').text();
            const description = item.find('.post_body');

            return {
                author,
                description: description.html(),
                title: `${author}: ${description.text()}`,
                link: item.find('.post_date a').attr('href'),
                pubDate: parseDate(item.find('.post_date').attr('title')),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
