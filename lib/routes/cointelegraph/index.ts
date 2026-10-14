import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['finance'],
    example: '/cointelegraph',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['cointelegraph.com/'],
            target: '/',
        },
    ],
    description: 'Get latest news from Cointelegraph with full text.',
};

async function handler(): Promise<Data> {
    const rssUrl = 'https://cointelegraph.com/rss';
    const feed = await parser.parseURL(rssUrl);

    const list = feed.items
        .filter((item) => item.link && /\/news|\/markets|\/explained|\/innovation-circle/.test(item.link))
        .map((item) => ({
            ...item,
            link: item.link?.split('?', 1)[0],
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async (): Promise<DataItem> => {
                const link = item.link!;

                // Extract full text
                const fullText = await extractFullText(link);

                if (!fullText) {
                    logger.warn(`Failed to extract content from ${link}`);
                }

                // Create article item
                return {
                    title: item.title || 'Untitled',
                    description: fullText || item.content,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    link,
                    author: item.creator || 'CoinTelegraph',
                    category: item.categories || [],
                    image: item.enclosure?.url,
                };
            })
        )
    );

    // Filter out null items
    const validItems = items.filter((item): item is DataItem => item !== null);

    return {
        title: feed.title || 'CoinTelegraph News',
        link: feed.link || 'https://cointelegraph.com',
        description: feed.description || 'Latest news from CoinTelegraph',
        language: feed.language || 'en',
        item: validItems,
    };
}

async function extractFullText(url: string): Promise<string | undefined> {
    try {
        const response = await ofetch(url);
        const $ = load(response);
        const content = $('[data-testid="post__body"]');
        if (!content.text().trim()) {
            return;
        }

        const cover = $('[data-testid="post-cover__image"]').first();
        cover.removeAttr('srcset sizes');

        return $.html(cover) + content.html();
    } catch (error) {
        logger.error(`Error fetching article content: ${error}`);
        return;
    }
}
