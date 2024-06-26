import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

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

    const list = $('a.group.border-b.py-10')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.children('h2').first().text(),
                link: baseUrl + $item.attr('href'),
                pubDate: parseDate($item.children('h3').first().text()),
                description: $item.children('p').first().text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                // Extract the full text
                const fullText = $('main').text();
                return { ...item, fullText };
            })
        )
    );

    return {
        title: 'ollama blog',
        link: 'https://ollama.com/blog',
        item: items,
    };
}
