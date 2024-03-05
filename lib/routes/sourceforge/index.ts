// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const routeParams = ctx.req.param('routeParams');

    const baseURL = 'https://sourceforge.net';
    const link = `https://sourceforge.net/directory/?${routeParams.toString()}`;

    const response = await got.get(link);
    const $ = load(response.data);
    const itemList = $('ul.projects li[itemprop=itemListElement]');

    ctx.set('data', {
        title: $('.content h1').text().trim(),
        link,
        item: itemList.toArray().map((element) => {
            const item = $(element);
            const title = item.find('.result-heading-title').text().trim();
            const link = `${baseURL}${item.find('.result-heading-title').attr('href')}`;
            const description = item.find('.result-heading-texts').html();
            const pubDate = parseDate(item.find('time').attr('datetime'), 'YYYY-MM-DD');

            return {
                title,
                link,
                description,
                pubDate,
            };
        }),
    });
};
