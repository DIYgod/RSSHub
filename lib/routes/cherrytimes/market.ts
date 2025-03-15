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
        const urls = Array.from({ length: 10 }, (_, i) => `https://cherrytimes.it/en/tag/markets?page=${i + 1}`);
        const responses = await Promise.all(urls.map((url) => ofetch(url)));

        const items = responses.flatMap((response) => {
            const $ = load(response);
            return $('div.post-container').toArray().map((item) => {
                const element = $(item);
                const a = element.find('a').eq(1);

                return {
                    title: a.text().trim(),
                    link: a.attr('href'),
                    description: element.find('p.excerpt').text(),
                    category: element.find('a').last().text(),
                };
            });
        });

        return {
            title: 'Market',
            link: 'https://cherrytimes.it/en/tag/markets',
            item: items,
        };
    },
};
