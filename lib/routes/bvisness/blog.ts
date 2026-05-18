import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Blog',
    categories: ['blog'],
    maintainers: ['raxod502'],
    path: '/blog',
    example: '/bvisness/blog',
    handler,
    radar: [
        {
            source: ['bvisness.me'],
            target: '/blog',
        },
    ],
};

async function handler() {
    const response = await ofetch('https://bvisness.me/');
    const $ = load(response);

    const items = $('article')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: new URL(a.attr('href'), 'https://bvisness.me/').href,
                pubDate: parseDate(item.find('time').attr('datetime')),
            };
        });

    return {
        title: 'Ben Visness Blog',
        link: 'https://bvisness.me/',
        item: items,
    };
}
