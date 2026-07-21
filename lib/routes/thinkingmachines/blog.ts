import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    name: 'Connectionism',
    url: 'thinkingmachines.ai/blog',
    maintainers: ['atollk'],
    example: '/thinkingmachines/blog',
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
    },
    radar: [
        {
            source: ['thinkingmachines.ai/blog', 'thinkingmachines.ai/blog/'],
            target: '/blog',
        },
    ],
    handler,
};

async function handler() {
    const baseUrl = 'https://thinkingmachines.ai';
    const listUrl = `${baseUrl}/blog/`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const items = $('main li a')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('.post-title').text().trim();
            const dateStr = $el.find('time.desktop-time').text().trim();
            const href = $el.attr('href') || '';
            const link = href.startsWith('http') ? href : `${baseUrl}${href}`;

            return { title, dateStr, link };
        })
        .filter((item) => item.title && item.link);

    const fullItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const articleResponse = await ofetch(item.link);
                const $article = load(articleResponse);

                // Remove non-content elements
                $article('nav, footer, header, script, style').remove();
                // Remove heading (title, author, pubDate) and paginator
                $article('.post-heading, #post-prev-link, #post-next-link').remove();

                const description = $article('main').html()?.trim() || '';

                return {
                    title: item.title,
                    link: item.link,
                    pubDate: parseDate(item.dateStr, 'MMM D, YYYY'),
                    description,
                };
            })
        )
    );

    return {
        title: 'Thinking Machines Lab - Connectionism',
        link: listUrl,
        item: fullItems,
    };
}
