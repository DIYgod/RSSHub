import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/code',
    categories: ['programming'],
    example: '/ollama/code',
    radar: [
        {
            source: ['ollama.com/library'],
        },
    ],
    name: 'Code Models',
    maintainers: ['gavrilov'],
    handler,
};
async function handler() {
    const response = await ofetch('https://ollama.com/search?c=code&sort=newest');
    const $ = load(response);
    const items = $('#repo > ul > li > a')
        .toArray()
        .map((item) => {
            const name = $(item).find('h2 span').first();
            const link = $(item).attr('href');
            const description = $(item).find('div p.break-words').first();
            const pubDate = $(item).find('span:contains("Updated")').first();

            return {
                title: name.text(),
                link,
                description: description.text(),
                pubDate: parseRelativeDate(pubDate.text()),
            };
        });
    return {
        title: 'ollama library code models',
        link: 'https://ollama.com/library',
        item: items,
    };
}
