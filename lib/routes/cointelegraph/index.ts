import { Route, Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import logger from '@/utils/logger';
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
    name: 'Cointelegraph News',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['cointelegraph.com/'],
            target: '/',
        },
    ],
    description: `Get latest news from Cointelegraph with full text.`,
};

async function handler(): Promise<Data> {
    const rssUrl = 'https://cointelegraph.com/rss';
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const link = item.link;
            if (!link) {
                return null;
            }

            const cleanLink = link.split('?')[0];

            // Skip non-article content
            if (!/\/news|\/explained|\/innovation-circle/.test(link)) {
                return null;
            }

            // Get cover URL from media content
            let coverUrl: string | undefined;
            const mediaContent = (item as any).media?.content;
            if (mediaContent && mediaContent.length > 0) {
                const url = mediaContent[0].url;
                if (url) {
                    // Extract the required part of the cover URL
                    const match = url.match(/(https:\/\/s3\.cointelegraph\.com\/.+)/);
                    coverUrl = match ? match[1] : url;
                }
            }

            // Extract full text
            const fullText = await cache.tryGet(cleanLink, async () => {
                const text = await extractFullText(cleanLink);
                return text || '';
            });

            if (!fullText) {
                logger.warn(`Failed to extract content from ${cleanLink}`);
                return null;
            }

            // Create article item
            return {
                title: item.title || 'Untitled',
                description: fullText,
                pubDate: item.pubDate ? parseDate(item.pubDate) : new Date(),
                link: cleanLink,
                author: item.creator || 'CoinTelegraph',
                category: item.categories || [],
                image: coverUrl,
            } as DataItem;
        })
    );

    // Filter out null items
    const validItems = items.filter((item): item is NonNullable<typeof item> => item !== null);

    return {
        title: feed.title || 'CoinTelegraph News',
        link: feed.link || 'https://cointelegraph.com',
        description: feed.description || 'Latest news from CoinTelegraph',
        language: feed.language || 'en',
        item: validItems,
    };
}

async function extractFullText(url: string): Promise<string | null> {
    try {
        const response = await ofetch(url);
        const $ = load(response);
        const article = $('.post-content');

        if (!article.length) {
            return null;
        }

        // Remove unwanted elements
        article.find('div.article-interlink').remove();
        article.find('div.article__badge').remove();
        article.find('div.article__share').remove();

        // Extract text from paragraphs and list items
        const textElements = article.find('p, li');
        let fullText = '';

        textElements.each((_, element) => {
            const text = $(element).text().trim();
            if (text) {
                fullText += `<p>${text}</p>`;
            }
        });

        return fullText || null;
    } catch (error) {
        logger.error(`Error fetching article content: ${error}`);
        return null;
    }
}
