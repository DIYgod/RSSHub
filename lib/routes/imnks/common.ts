import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    name: 'Unknown',
    maintainers: ['mapleshadow'],
    handler,
};

async function handler() {
    const link = 'https://imnks.com';
    const response = await got(link);
    const data = response.data;
    const $ = load(data);
    const list = $('#content article')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.featured-container').text(),
                link: item.find('.entry-title').children('a').attr('href'),
                description: item.find('.entry-summary.ss').children('div').text(),
                pubDate: timezone(parseDate(item.find('.entry-meta').children('time').attr('datetime'), 'YYYY年MM月DD日 HH:mm'), +8),
            };
        });

    return {
        title: $('title').text(),
        link,
        item: list,
    };
}
