import { Route, Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/coindesk/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'CoinDesk News',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['coindesk.com/'],
            target: '/news',
        },
    ],
    description: `Get latest news from CoinDesk with full text.`,
};

async function handler(): Promise<Data> {
    const rssUrl = 'http://feeds.feedburner.com/Coindesk';
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const link = item.link;
            if (!link) {
                return null;
            }

            const cleanLink = link.split('?')[0];

            // Get cover URL from media content
            let coverUrl: string | undefined;
            const mediaContent = (item as any).media?.content;
            if (mediaContent && mediaContent.length > 0) {
                const url = mediaContent[0].url;
                if (url) {
                    // Extract the required part of the cover URL
                    const match = url.match(/https?:\/\/(?:www\.)?(?:\S+?\/)?([a-z]+-?\d+\.images\..+?\/coindesk\/.+)/i);
                    coverUrl = match ? `https://${match[1]}` : url;
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
                author: item.creator || 'CoinDesk',
                category: item.categories || [],
                image: coverUrl,
            } as DataItem;
        })
    );

    // Filter out null items
    const validItems = items.filter((item): item is NonNullable<typeof item> => item !== null);

    return {
        title: feed.title || 'CoinDesk News',
        link: feed.link || 'https://coindesk.com',
        description: feed.description || 'Latest news from CoinDesk',
        language: feed.language || 'en',
        item: validItems,
    };
}

async function extractFullText(url: string): Promise<string | null> {
    try {
        const response = await ofetch(url);
        const $ = load(response);
        const article = $('div[data-module-name="article-body"]');

        if (!article.length) {
            return null;
        }

        // Remove unwanted elements
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
