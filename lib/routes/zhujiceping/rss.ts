import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/zhujiceping',
    radar: [
        {
            source: ['zhujiceping.com/'],
        },
    ],
    name: '最新发布',
    maintainers: ['cnkmmk'],
    handler,
    url: 'zhujiceping.com/',
};

async function handler() {
    const url = 'https://www.zhujiceping.com/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);

    const list = $('article.excerpt')
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('h2 > a').attr('title');
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.note').text();
            const dateraw = element.find('time').text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY-MM-DD'),
            };
        });

    return {
        title: '国外主机测评',
        link: url,
        item: list,
    };
}
