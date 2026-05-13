import { load } from 'cheerio';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/showcase/:category?',
    categories: ['traditional-media'],
    example: '/farsnews/showcase',
    parameters: { category: 'Category slug from farsnews.ir/showcase URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{
        source: ['farsnews.ir/showcase'],
        target: '/showcase',
    }],
    name: 'Showcase',
    maintainers: [],
    handler,
    description: 'Fars News showcase articles. Persian news agency.',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const baseUrl = 'https://farsnews.ir';
    const currentUrl = category ? `${baseUrl}/showcase/${category}` : `${baseUrl}/showcase`;

    const response = await got({ method: 'get', url: currentUrl });
    const $ = load(response.data);

    const items = $('a[href^="/"]')
        .toArray()
        .map((item) => {
            item = $(item);
            const href = item.attr('href');
            const title = item.find('h2, h3').first().text().trim() || item.text().trim();

            if (!href || !title || !/^\/[^/]+\/\d+\//.test(href)) {
                return null;
            }

            return {
                title,
                link: `${baseUrl}${href}`,
            };
        })
        .filter((item) => item !== null)
        .filter((item, index, self) => self.findIndex((i) => i.link === item.link) === index);

    const processedItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const detail$ = load(detailResponse.data);

                    const desc = detail$('meta[name="description"]').attr('content') || '';
                    item.description = desc;

                    const timeText = detail$('time').attr('datetime') || detail$('.text-gray-400').first().text();
                    if (timeText) {
                        item.pubDate = parseDate(timeText);
                    }
                } catch {
                    // Silently continue if detail fetch fails
                }
                return item;
            })
        )
    );

    return {
        title: 'Fars News - Showcase',
        link: currentUrl,
        item: processedItems,
    };
}
