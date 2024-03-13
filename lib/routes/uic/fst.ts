import { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/fst',
    categories: ['university'],
    example: '/uic/fst',
    name: 'UIC FST',
    maintainers: ['heimoshuiyu'],
    features: {},
    handler,
};

async function handler() {
    const rootUrl = 'https://fst.uic.edu.cn/news_events/news.htm';

    const response = await got.get(rootUrl);

    const $ = cheerio.load(response.data);

    const items = await Promise.all(
        $('div.news-list-box > a')
            .map(async (_, item) => {
                const link = $(item).attr('href');
                const subResponse = await got.get('https://fst.uic.edu.cn/news_events/' + link);
                const $$ = cheerio.load(subResponse.data);
                return {
                    title: $(item).find('h3').text(),
                    link,
                    pubDate: parseDate($(item).find('div.date').text(), 'YYYY/MM/DD'),
                    description: $$('div.v_news_content').html() || '',
                };
            })
            .get()
    );

    return {
        title: $('title').text() + $('div.breadcrumb').text(),
        link: rootUrl,
        item: items,
    };
}
