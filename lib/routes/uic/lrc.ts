import { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/lrc',
    categories: ['university'],
    example: '/uic/lrc',
    name: 'UIC LRC',
    maintainers: ['heimoshuiyu'],
    features: {},
    handler,
};

async function handler() {
    const rootUrl = 'https://lrc.uic.edu.cn/index/xwytz.htm';

    const response = await got.get(rootUrl);

    const $ = cheerio.load(response.data);

    const items = await Promise.all(
        $('tbody > tr.cat-list-row0')
            .map(async (_, item) => {
                const link = $(item).find('a').attr('href');
                const subResponse = await got.get('https://lrc.uic.edu.cn/index/' + link);
                const $$ = cheerio.load(subResponse.data);
                return {
                    title: $(item).find('td.list-title').text(),
                    link,
                    pubDate: parseDate($(item).find('td.list-date').text(), 'YYYY年MM月DD日'),
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
