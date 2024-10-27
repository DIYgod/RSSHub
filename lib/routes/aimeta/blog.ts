import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog', 'programming'],
    example: '/aimeta/blog',
    radar: [{ source: ['ai.meta.com/blog'] }],
    name: 'Blog',
    maintainers: ['canonnizq'],
    handler
};

async function handler() {
    const baseUrl = 'https://ai.meta.com';

    const response = await ofetch(`${baseUrl}/blog`);
    const $ = load(response);

    const items = $('div._amsu')
        .toArray().map((item) => ({
            category: $(item).children('p._amt0').first().text(),
            link: $(item).children('a._amt1').first().attr('href'),
            title: $(item).children('p._amt2').first().text(),
            description: $(item).children('p._amt3').first().text(),
            pubDate: parseDate($(item).children('div._amt4').first().text())
        }));

    return {
        title: 'AI at Meta Blog',
        link: 'https://ai.meta.com/blog',
        item: items
    };
}