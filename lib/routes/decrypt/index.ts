import { Route, Data } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['finance'],
    example: '/decrypt',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Decrypt News',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['decrypt.co/'],
            target: '/',
        },
    ],
    description: `Get latest news from Decrypt.`,
};

async function handler(ctx): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    const rssUrl = 'https://decrypt.co/feed/';

    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.slice(0, limit).map((item) =>
            cache.tryGet(`decrypt:article:${item.link || ''}`, async () => {
                if (!item.link) {
                    return {};
                }

                try {
                    const fullText = await extractFullText(item.link);

                    // If we got the full text, use it
                    if (fullText) {
                        return {
                            title: item.title || 'Untitled',
                            link: item.link.split('?')[0], // Clean URL by removing query parameters
                            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                            description: fullText,
                            author: item.creator || 'Decrypt',
                            category: item.categories || [],
                            guid: item.guid || item.link,
                            image: (item as any).media?.thumbnail?.[0]?.$?.url,
                        };
                    }

                    // If we couldn't get the full text, use the summary from RSS
                    return {
                        title: item.title || 'Untitled',
                        link: item.link.split('?')[0],
                        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                        description: item.content || (item as any).description || '',
                        author: item.creator || 'Decrypt',
                        category: item.categories || [],
                        guid: item.guid || item.link,
                        image: (item as any).media?.thumbnail?.[0]?.$?.url,
                    };
                } catch (error: any) {
                    logger.warn(`Couldn't fetch full content for ${item.link}: ${error.message}`);

                    // Fallback to RSS content
                    return {
                        title: item.title || 'Untitled',
                        link: item.link.split('?')[0],
                        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                        description: item.content || (item as any).description || '',
                        author: item.creator || 'Decrypt',
                        category: item.categories || [],
                        guid: item.guid || item.link,
                        image: (item as any).media?.thumbnail?.[0]?.$?.url,
                    };
                }
            })
        )
    );

    // Filter out video content and empty items
    const filteredItems = items.filter((item) => item && item.link && !item.link.includes('/videos'));

    return {
        title: feed.title || 'Decrypt',
        link: feed.link || 'https://decrypt.co',
        description: feed.description || 'Latest news from Decrypt',
        item: filteredItems,
        language: feed.language || 'en',
        image: feed.image?.url,
    } as Data;
}

async function extractFullText(url: string): Promise<string | null> {
    try {
        const response = await ofetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            },
        });

        const $ = load(response);

        // Find the main article content based on the Python implementation
        const articleSelector = String.raw`div.grid.grid-cols-1.md\:grid-cols-8.unreset.post-content.md\:pb-20`;
        const article = $(articleSelector);

        if (article.length) {
            // Remove unwanted elements as in the Python implementation
            article.find('div.my-4.border-b.border-decryptGridline').remove();

            // Extract specific elements, similar to the Python implementation
            const contentElements = article.find('p, li');
            let fullText = '';

            contentElements.each((_, element) => {
                fullText += `<${element.name}>${$(element).html()}</${element.name}>`;
            });

            if (fullText) {
                return fullText;
            }
        }

        return null;
    } catch (error) {
        logger.error(`Error extracting full text from ${url}: ${error}`);
        return null;
    }
}
