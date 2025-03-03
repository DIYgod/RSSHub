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
    example: '/blockworks',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['blockworks.co/'],
            target: '/',
        },
    ],
    name: 'Blockworks News',
    maintainers: ['pseudoyu'],
    handler,
    description: `Blockworks news with full text support.`,
};

async function handler(): Promise<Data> {
    const rssUrl = 'https://blockworks.co/feed';
    const feed = await parser.parseURL(rssUrl);

    // Limit to 20 items
    const limitedItems = feed.items.slice(0, 20);

    const items = await Promise.all(
        limitedItems.map(async (item) => {
            const articleUrl = item.link || '';
            const cleanUrl = articleUrl.split('?')[0];

            // Get cached content or fetch new content
            const fullText = await cache.tryGet(`blockworks:${cleanUrl}`, () => extractFullText(cleanUrl));

            // Get cover image
            const coverUrl = await cache.tryGet(`blockworks:cover:${cleanUrl}`, () => extractCoverUrl(cleanUrl));

            return {
                title: item.title || 'Untitled',
                pubDate: item.isoDate ? parseDate(item.isoDate) : new Date(),
                link: cleanUrl,
                description: fullText || item.content || item.summary || '',
                author: item.creator,
                category: item.categories,
                media: coverUrl
                    ? {
                          content: { url: coverUrl },
                      }
                    : undefined,
            } as DataItem;
        })
    );

    return {
        title: feed.title || 'Blockworks News',
        link: feed.link || 'https://blockworks.co',
        description: feed.description || 'Latest news from Blockworks',
        item: items,
        language: feed.language || 'en',
    };
}

async function extractFullText(url: string): Promise<string> {
    try {
        const response = await ofetch(url);
        const $ = load(response);

        const articleSection = $('section.w-full');

        if (articleSection.length) {
            // Extract all paragraph and list items
            const allElements = articleSection.find('p, li');
            let text = '';

            allElements.each((_, element) => {
                const content = $(element).text().trim();
                if (content) {
                    text += content + '\n\n';
                }
            });

            // Remove promotional content at the end
            const promoStartKeywords = ["Get the day's top crypto", 'Want alpha sent', "Can't wait?"];

            for (const keyword of promoStartKeywords) {
                const index = text.indexOf(keyword);
                if (index !== -1) {
                    text = text.substring(0, index).trim();
                }
            }

            return text || '';
        }

        return '';
    } catch (error) {
        logger.error('Error extracting full text from Blockworks:', error);
        return '';
    }
}

async function extractCoverUrl(url: string): Promise<string> {
    try {
        const response = await ofetch(url);
        const $ = load(response);

        const imageContainer = $('div.w-full.relative');
        if (imageContainer.length) {
            const imgTag = imageContainer.find('img[alt="article-image"]');
            if (imgTag.length && imgTag.attr('src')) {
                let imgUrl = imgTag.attr('src') as string;

                if (!imgUrl.startsWith('http')) {
                    imgUrl = `https://blockworks.co${imgUrl}`;
                }

                return decodeURIComponent(imgUrl);
            }
        }

        return '';
    } catch (error) {
        logger.error('Error extracting cover URL from Blockworks:', error);
        return '';
    }
}
