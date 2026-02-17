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

    const items = await Promise.all(
        feed.items
            .filter((item) => item.link && /\/news|\/explained|\/innovation-circle/.test(item.link))
            .map((item) => ({
                ...item,
                link: item.link?.split('?')[0],
            }))
            .map((item) =>
                cache.tryGet(item.link!, async () => {
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
                        category: item.categories?.map((c) => c.trim()) || [],
                        image: item.enclosure?.url,
                    } as DataItem;
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

async function extractFullText(url: string): Promise<string | null> {
    try {
        const response = await ofetch(url);
        const $ = load(response);
        const nuxtData = $('script:contains("window.__NUXT__")').text();
        const fullText = JSON.parse(nuxtData.match(/\.fullText=(".*?");/)?.[1] || '{}');
        const cover = $('.post-cover__image');

        // Remove unwanted elements
        cover.find('source').remove();
        cover.find('img').removeAttr('srcset');
        cover.find('img').attr(
            'src',
            cover
                .find('img')
                .attr('src')
                ?.match(/(https:\/\/s3\.cointelegraph\.com\/.+)/)?.[1] || ''
        );

        return cover.html() + fullText || null;
    } catch (error) {
        logger.error(`Error fetching article content: ${error}`);
        return null;
    }
}
