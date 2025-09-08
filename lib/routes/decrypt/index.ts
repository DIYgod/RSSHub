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
    name: 'News',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['decrypt.co/'],
            target: '/',
        },
    ],
    description: 'Get latest news from Decrypt.',
};

async function handler(ctx): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    const rssUrl = 'https://decrypt.co/feed';

    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items
            .filter((item) => item && item.link && !item.link.includes('/videos'))
            .slice(0, limit)
            .map((item) =>
                cache.tryGet(`decrypt:article:${item.link}`, async () => {
                    if (!item.link) {
                        return {};
                    }

                    try {
                        const result = await extractFullText(item.link);
                        return {
                            title: item.title || 'Untitled',
                            link: item.link.split('?')[0], // Clean URL by removing query parameters
                            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                            description: result?.fullText ?? (item.content || ''),
                            author: item.creator || 'Decrypt',
                            category: result?.tags ? [...new Set([...(item.categories ?? []), ...result.tags])] : item.categories || [],
                            guid: item.guid || item.link,
                            image: result?.featuredImage ?? item.enclosure?.url,
                        };
                    } catch (error: any) {
                        logger.warn(`Couldn't fetch full content for ${item.link}: ${error.message}`);

                        // Fallback to RSS content
                        return {
                            title: item.title || 'Untitled',
                            link: item.link.split('?')[0],
                            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                            description: item.content || '',
                            author: item.creator || 'Decrypt',
                            category: item.categories || [],
                            guid: item.guid || item.link,
                            image: item.enclosure?.url,
                        };
                    }
                })
            )
    );

    return {
        title: feed.title || 'Decrypt',
        link: feed.link || 'https://decrypt.co',
        description: feed.description || 'Latest news from Decrypt',
        item: items,
        language: feed.language || 'en',
        image: feed.image?.url,
    } as Data;
}

async function extractFullText(url: string): Promise<{ fullText: string; featuredImage: string; tags: string[] } | null> {
    try {
        const response = await ofetch(url);

        const $ = load(response);

        const nextData = JSON.parse($('script#__NEXT_DATA__').text());
        const post = nextData.props.pageProps.post;

        if (post.content.length) {
            const fullText = `<img src="${post.featuredImage.src}" alt="${post.featuredImage.alt}">` + post.content;

            return {
                fullText,
                featuredImage: post.featuredImage.src,
                tags: post.tags.data.map((tag) => tag.name),
            };
        }

        return null;
    } catch (error) {
        logger.error(`Error extracting full text from ${url}: ${error}`);
        return null;
    }
}
