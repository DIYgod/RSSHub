// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = `https://finviz.com/quote.ashx?t=${ctx.req.param('ticker')}`;
    const response = await got(link);

    const $ = load(response.body);
    const data = $('table.fullview-news-outer tr');

    let dateRow = '';
    const item = await Promise.all(
        data
            .map((i, e) => {
                let date = $(e).find('td').first().text().trim();
                if (date.includes('-')) {
                    dateRow = date.split(' ')[0];
                } else {
                    date = `${dateRow} ${date}`;
                }
                return {
                    title: $(e).find('a').text(),
                    pubDate: parseDate(date, 'MMM-DD-YY HH:mmA'),
                    author: $(e).find('span').text(),
                    link: $(e).find('a').attr('href'),
                };
            })
            .get()
    );

    const name = $('.fullview-title b').text();

    ctx.set('data', {
        title: `${ctx.req.param('ticker')} ${name} News by Finviz`,
        link,
        description: `A collection of ${name} news aggregated by Finviz.`,
        item,
    });
};
