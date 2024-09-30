import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/dbaplus',
    radar: [
        {
            source: ['dbaplus.cn/'],
        },
    ],
    name: '最新文章',
    maintainers: ['cnkmmk'],
    handler,
    url: 'dbaplus.cn/',
};

async function handler() {
    const url = 'https://dbaplus.cn';
    const response = await got(`${url}/news-9-1.html`);
    const $ = load(response.data);

    const list = $('div.col-xs-12.col-md-8.pd30 > div.panel.panel-default.categeay > div.panel-body > ul.media-list.clearfix > li.media')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h3 > a').text();
            const link = element.find('h3 > a').attr('href');
            const description = element.find('div.mt10.geay').text();
            const dateraw = element.find('span.time').text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY年MM月DD日'),
            };
        })
        .get();

    return {
        title: 'dbaplus社群',
        link: url,
        item: list,
    };
}
