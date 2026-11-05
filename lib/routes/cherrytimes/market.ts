import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/market',
    categories: ['new-media'],
    example: '/cherrytimes/market',
    name: 'Market',
    maintainers: ['canonnizq'],

    handler: async () => {
        const response = await ofetch('https://cherrytimes.it/en/tag/markets?page=1');
        const $ = load(response);
        const items = $('div.post-container')
            .toArray()
            .map((item) => {
                const element = $(item);
                const a = element.find('a').eq(1);
                const date = element.find('p.info').text();

                return {
                    title: a.text(),
                    link: a.attr('href'),
                    description: element.find('p.excerpt').text(),
                    category: element.find('a').last().text(),
                    pubDate: date ? parseDate(`${date} GMT`) : undefined,
                };
            });

        return {
            title: 'Cherry Times - Market',
            link: 'https://cherrytimes.it/en/tag/markets',
            item: items,
        };
    },
};
