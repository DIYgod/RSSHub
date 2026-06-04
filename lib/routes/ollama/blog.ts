import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/ollama/blog',
    radar: [
        {
            source: ['ollama.com/blog'],
        },
    ],
    name: 'Blog',
    maintainers: ['gavrilov'],
    handler,
};

async function handler() {
    const baseUrl = 'https://ollama.com';

    const response = await ofetch(`${baseUrl}/blog`);
    const $ = load(response);

    const items = $('a.group.border-b.py-10')
        .toArray()
        .map((item) => ({
            title: $(item).children('h2').first().text(),
            link: baseUrl + $(item).attr('href'),
            pubDate: parseDate($(item).children('h3').first().text()),
            description: $(item).children('p').first().text(),
        }));
    return {
        title: 'ollama blog',
        link: 'https://ollama.com/blog',
        item: items,
    };
}
