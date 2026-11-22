import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/zrblog',
    radar: [
        {
            source: ['zrblog.net/'],
        },
    ],
    name: '最新文章',
    maintainers: ['cnkmmk'],
    handler,
    url: 'zrblog.net/',
};
async function handler() {
    const url = 'https://www.zrblog.net/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);
    const list = $('article.excerpt')
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('h2 > a').text();
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.note').text();
            const dateText = element.find('time').text();
            const category = element
                .find('a.cat')
                .contents()
                .filter((_, node) => node.type === 'text')
                .text();
            return {
                title,
                description,
                link,
                pubDate: parseDate(dateText, 'YYYY-MM-DD'),
                category: [category],
            };
        });
    return {
        title: '赵容部落',
        link: url,
        item: list,
    };
}
