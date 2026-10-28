import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

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
    maintainers: ['Nick22nd', 'gavrilov'],
    handler,
};
async function handler() {
    const response = await ofetch('https://ollama.com/library?sort=newest');
    const $ = load(response);
    const items = $('#repo > ul > li > a')
        .toArray()
        .map((item) => {
            const name = $(item).find('h2 span');
            const link = $(item).attr('href');
            const description = $(item).find('div p.break-words');
            const date = $(item)
                .find('span:contains("Updated")')
                .first()
                .text()
                .trim()
                .replace(/^Updated\s*/i, '');

            return {
                title: name.text(),
                link,
                description: description.text(),
                pubDate: date ? parseRelativeDate(date) : undefined,
            };
        });
    return {
        title: 'ollama library',
        language: 'en' as const,
        link: 'https://ollama.com/library',
        item: items,
    };
}
