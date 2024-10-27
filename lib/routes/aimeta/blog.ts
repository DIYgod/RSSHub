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

    const items = $('div._ams_')
        .toArray().map((item) => ({
            category: $(item).children('p._amt0').text(),
            link: $(item).children('a._amt1').attr('href'),
            title: $(item).children('a._amt1').children('p._amt2').text(),
            description: $(item).children('p._4ik4._4ik5').children('p._amt3').text(),
            pubDate: parseDate($(item).children('p._amt4').text())
        }));

    return {
        title: 'AI at Meta Blog',
        link: 'https://ai.meta.com/blog',
        item: items
    };
}