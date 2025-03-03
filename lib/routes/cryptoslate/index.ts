import { Route, Data } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';

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
    name: 'CryptoSlate News',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['cryptoslate.com/'],
            target: '/',
        },
    ],
    description: `Get latest news from CryptoSlate.`,
};

async function handler(ctx): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    const rssUrl = 'https://cryptoslate.com/feed/';

    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.slice(0, limit).map((item) =>
            cache.tryGet(`cryptoslate:article:${item.link || ''}`, async () => {
                if (!item.link) {
                    return {};
                }

                // Skip non-article content
                if (item.link.includes('/feed') || item.link.includes('#respond')) {
                    return {};
                }

                try {
                    // Clean URL by removing query parameters
                    const cleanUrl = item.link.split('?')[0];

                    const fullText = await Promise.resolve(extractFullTextFromRSS(item));

                    if (!fullText) {
                        return {};
                    }

                    // Get cover URL from media content
                    let coverUrl = null;
                    if ((item as any).media?.content && (item as any).media.content.length > 0) {
                        coverUrl = (item as any).media.content[0].url;
                    }

                    return {
                        title: item.title || 'Untitled',
                        link: cleanUrl,
                        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                        description: fullText,
                        author: item.creator || 'CryptoSlate',
                        category: item.categories || [],
                        guid: item.guid || item.link,
                        image: coverUrl,
                    };
                } catch (error: any) {
                    logger.warn(`Couldn't process article from CryptoSlate: ${item.link}: ${error.message}`);
                    return {};
                }
            })
        )
    );

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
        // Get content from the RSS feed - match Python's approach precisely
        const contentEncoded = entry.content && Array.isArray(entry.content) && entry.content.length > 0 ? entry.content[0].value : (typeof entry.content === 'string' ? entry.content : '');

        if (!contentEncoded) {
            return null;
        }

        const $ = load(contentEncoded);

        // Remove unwanted elements
        $('img').remove();
        $('figure').remove();

        // Extract text from p and li elements
        const allElements = $('p, li');
        let fullText = '';

        allElements.each((_, element) => {
            const elementText = $(element).text().trim();
            if (elementText) {
                fullText += `<${element.name}>${$(element).html()}</${element.name}>`;
            }
        });

        return fullText || null;
    } catch (error) {
        logger.error(`Error extracting full text from RSS: ${error}`);
        return null;
    }
}
