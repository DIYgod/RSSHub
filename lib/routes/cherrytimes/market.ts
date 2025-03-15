import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/market',
    categories: ['new-media'],
    example: '/cherrytimes/market',
    name: 'Market',
    maintainers: ['canonnizq'],

    handler: async (ctx) => {
        let items = [];

        for (let i = 1; i <= 10; i++) {
            const response = await ofetch(`https://cherrytimes.it/en/tag/markets?page=${i}`);
            const $ = load(response);

            items = items.concat($('div.post-container')
                .toArray().map((item) => {
                    item = $(item);
                    const a = item.find('a').eq(1);
                    return {
                        title: a.text(),
                        link: a.attr('href'),
                        description: item.find('p.excerpt').text(),
                        category: item.find('a').last().text()
                    };
                }));
        }

        return {
            title: 'Market',
            link: 'https://cherrytimes.it/en/tag/markets',
            item: items
        };
    },
};