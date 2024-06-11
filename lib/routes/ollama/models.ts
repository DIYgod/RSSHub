import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/library',
    categories: ['programming'],
    example: '/ollama/library',
    radar: [
        {
            source: ['ollama.com/library'],
        },
    ],
    name: 'Models',
    maintainers: ['Nick22nd'],
    handler,
};
async function handler() {
    const response = await ofetch('https://ollama.com/library');
    const $ = load(response);
    const items = $('#repo > ul > li > a')
        .toArray()
        .map((item) => {
            const name = $(item).children('h2').first();
            const link = $(item).attr('href');
            const description = $(item).children('p').first();

            return {
                title: name.text(),
                link,
                description: description.text(),
            };
        });
    return {
        title: 'ollama library',
        link: 'https://ollama.com/library',
        item: items,
    };
}
