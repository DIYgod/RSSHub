import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:ticker',
    categories: ['finance'],
    example: '/finviz/news/AAPL',
    parameters: { ticker: 'The stock ticker' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'US Stock News',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const link = `https://finviz.com/quote.ashx?t=${ctx.req.param('ticker')}`;
    const response = await got(link);

    const $ = load(response.body);
    const data = $('table.fullview-news-outer tr');

    let dateRow = '';
    const item = await Promise.all(
        data.toArray().map((e) => {
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
    );

    const name = $('.fullview-title b').text();

    return {
        title: `${ctx.req.param('ticker')} ${name} News by Finviz`,
        link,
        description: `A collection of ${name} news aggregated by Finviz.`,
        item,
    };
}
