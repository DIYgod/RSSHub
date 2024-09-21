import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/njuferret/blog',
    radar: [
        {
            source: ['njuferret.github.io'],
        },
    ],
    name: 'Blogs',
    maintainers: ['tyl0622'],
    handler,
};

async function handler() {
    const baseUrl = 'https://njuferret.github.io';
    const response = await ofetch(baseUrl);
    const $ = load(response);

    const items = $('div.post-block')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('time').attr('datetime')),
            };
        });

    return {
        title: 'njuferret - blog',
        item: items,
    };
}
