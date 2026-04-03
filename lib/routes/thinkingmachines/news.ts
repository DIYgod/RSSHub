import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

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
            source: ['thinkingmachines.ai/news', 'thinkingmachines.ai/news/'],
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
                try {
                    const articleResponse = await ofetch(item.link);
                    const $article = load(articleResponse);

                    // Remove nav, footer, and other non-content elements
                    $article('nav, footer, header, script, style').remove();

                    const description = $article('main').html()?.trim() || $article('article').html()?.trim() || '';

                    return {
                        title: item.title,
                        link: item.link,
                        pubDate: parseDate(item.dateStr, 'MMM D, YYYY'),
                        description,
                    };
                } catch {
                    return {
                        title: item.title,
                        link: item.link,
                        pubDate: parseDate(item.dateStr, 'MMM D, YYYY'),
                        description: '',
                    };
                }
            })
        )
    );

    return {
        title: 'Thinking Machines Lab - News',
        link: listUrl,
        item: fullItems,
    };
}
