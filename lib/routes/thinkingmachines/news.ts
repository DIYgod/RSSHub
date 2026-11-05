import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    name: 'News',
    url: 'thinkingmachines.ai/news',
    maintainers: ['w3nhao'],
    example: '/thinkingmachines/news',
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
    },
    radar: [
        {
            source: ['thinkingmachines.ai/news'],
            target: '/news',
        },
    ],
    handler,
};

async function handler() {
    const baseUrl = 'https://thinkingmachines.ai';
    const listUrl = `${baseUrl}/news/`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const items = $('main li a')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('.post-title').text();
            const dateStr = $el.find('time').attr('datetime');
            const href = $el.attr('href') || '';
            const link = href.startsWith('http') ? href : `${baseUrl}${href}`;

            return { title, dateStr, link };
        })
        .filter((item) => item.title && item.link);

    const fullItems = await pMap(
        items,
        async (item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.dateStr ? parseDate(`${item.dateStr}T00:00:00Z`) : undefined,
            ...(await cache.tryGet(item.link, async () => {
                const articleResponse = await ofetch(item.link);
                const $article = load(articleResponse);
                const author = $article('.publish-metadata .author').text();

                // Remove non-content elements
                $article('nav, footer, header, script, style').remove();
                // Remove heading (title, author, pubDate) and paginator
                $article('.post-heading, #post-prev-link, #post-next-link').remove();

                const description = $article('main').html()?.trim() || '';

                return {
                    author: author || undefined,
                    description,
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: 'Thinking Machines Lab - News',
        link: listUrl,
        item: fullItems,
    };
}
