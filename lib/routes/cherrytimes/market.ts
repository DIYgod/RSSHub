import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

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

                return {
                    title: a.text(),
                    link: a.attr('href'),
                    description: element.find('p.excerpt').text(),
                    category: element.find('a').last().text(),
                };
            });

        return {
            title: 'Cherry Times - Market',
            link: 'https://cherrytimes.it/en/tag/markets',
            item: items,
        };
    },
};
