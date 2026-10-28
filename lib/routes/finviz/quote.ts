import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

dayjs.extend(utc);
dayjs.extend(timezone);

const newsTimezone = 'America/New_York';

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
    const response = await ofetch.raw(link, { responseType: 'text' });

    const $ = load(response._data!);
    const data = $('table.fullview-news-outer tr');

    const responseDate = response.headers.get('date');
    const currentDate = responseDate ? parseDate(responseDate) : undefined;
    const today = currentDate && Number.isFinite(currentDate.getTime()) ? dayjs(currentDate).tz(newsTimezone).locale('en').format('MMM-DD-YY') : undefined;
    let dateRow: string | undefined;
    const item = data.toArray().map((e) => {
        const date = $(e).find('td').first().text().trim();
        const parts = date.match(/^(Today|[A-Za-z]{3}-\d{2}-\d{2})\s+/);
        if (parts) {
            dateRow = parts[1] === 'Today' ? today : parts[1];
        }
        const time = date.match(/\d{1,2}:\d{2}[AP]M$/)?.[0];
        const pubDate = dateRow && time ? parseDate(dayjs.tz(`${dateRow} ${time}`, 'MMM-DD-YY hh:mmA', newsTimezone).format()) : undefined;
        return {
            title: $(e).find('a').text(),
            pubDate,
            author: $(e).find('span').text(),
            link: $(e).find('a').attr('href'),
        };
    });

    const name = $('.fullview-title b').text();

    return {
        title: `${ctx.req.param('ticker')} ${name} News by Finviz`,
        link,
        description: `A collection of ${name} news aggregated by Finviz.`,
        item,
    };
}
