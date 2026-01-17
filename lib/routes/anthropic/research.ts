import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/research',
    categories: ['programming'],
    example: '/anthropic/research',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/research', 'www.anthropic.com'],
        },
    ],
    name: 'Research',
    maintainers: ['ttttmr'],
    handler,
    url: 'www.anthropic.com/research',
};

async function handler() {
    const link = 'https://www.anthropic.com/research';
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('a[class*="PublicationList"]')
        .toArray()
        .map((el) => {
            const $el = $(el);
            return {
                title: $el.find('[class*="title"]').text().trim(),
                link: `https://www.anthropic.com${$el.attr('href')}`,
                pubDate: parseDate($el.find('[class*="date"]').text().trim()),
            };
        });

    return {
        title: 'Anthropic Research',
        link,
        description: 'Latest research from Anthropic',
        item: items,
    };
}
