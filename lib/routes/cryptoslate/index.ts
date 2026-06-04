import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['finance'],
    example: '/cryptoslate',
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
            source: ['cryptoslate.com/'],
            target: '/',
        },
    ],
    description: 'Get latest news from CryptoSlate.',
};

async function handler(ctx): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    const rssUrl = 'https://cryptoslate.com/feed/';

    const feed = await parser.parseURL(rssUrl);

    const items = feed.items
        .filter((item) => !item.link?.includes('/feed') && !item.link?.includes('#respond'))
        .slice(0, limit)
        .map((item) => {
            if (!item.link) {
                return {};
            }

            try {
                // Clean URL by removing query parameters
                const cleanUrl = item.link.split('?')[0];

                return {
                    title: item.title || 'Untitled',
                    link: cleanUrl,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    description: extractFullTextFromRSS(item),
                    author: item.creator || 'CryptoSlate',
                    category: item.categories || [],
                    guid: item.guid || item.link,
                    image: item.enclosure?.url,
                };
            } catch (error: any) {
                logger.warn(`Couldn't process article from CryptoSlate: ${item.link}: ${error.message}`);
                return {};
            }
        });

    // Filter out empty items
    const filteredItems = items.filter((item) => item && Object.keys(item).length > 0);

    return {
        title: feed.title || 'CryptoSlate',
        link: feed.link || 'https://cryptoslate.com',
        description: feed.description || 'Latest news from CryptoSlate',
        item: filteredItems,
        language: feed.language || 'en',
        image: feed.image?.url,
    } as Data;
}

function extractFullTextFromRSS(entry: any): string | null {
    try {
        const contentEncoded = entry['content:encoded'] || entry['content:encodedSnippet'] || entry.content || entry.contentSnippet;

        if (!contentEncoded) {
            return null;
        }

        const $ = load(contentEncoded);

        // Remove unwanted elements
        $('img').remove();
        $('figure').remove();

        return $.html() || null;
    } catch (error) {
        logger.error(`Error extracting full text from RSS: ${error}`);
        return null;
    }
}
