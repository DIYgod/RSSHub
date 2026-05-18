import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Blog',
    categories: ['blog'],
    maintainers: ['raxod502'],
    path: '/blog',
    example: '/aschmelyun/blog',
    handler,
    radar: [
        {
            source: ['aschmelyun.com'],
            target: '/blog',
        },
    ],
};

async function handler() {
    const response = await ofetch('https://aschmelyun.com/blog/');
    const $ = load(response);

    const items = $('div.rounded-lg')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a.text-xl').first();
            return {
                title: a.text(),
                link: new URL(a.attr('href'), 'https://aschmelyun.com/blog/').href,
                pubDate: parseDate(item.find('span.text-sm').text()),
                category: item
                    .find('a.rounded-full')
                    .toArray()
                    .map((cat) => $(cat).text().trim()),
                description: item.find('p').first().text(),
            };
        });

    return {
        title: 'Andrew Schmelyun Blog',
        link: 'https://aschmelyun.com/',
        item: items,
    };
}
