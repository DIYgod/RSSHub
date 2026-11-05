import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

type BlockArticle = {
    id: number;
    title: string;
    url: string;
    thumbnail?: string;
    published?: string;
    authors?: Array<{
        name: string;
    }>;
    primaryCategory?: {
        name: string;
    };
    subheading?: string;
    preview?: string;
};
type BlockArticleDetails = Pick<DataItem, 'description' | 'pubDate' | 'updated' | 'category'> & {
    thumbnail?: string;
};
type BlockPost = {
    body?: string;
    intro?: string;
    published?: string;
    modified?: string;
    thumbnail?: string;
    categories: Array<{
        name: string;
    }>;
    tags: Array<{
        name: string;
    }>;
};
export const route: Route = {
    path: '/category/:category',
    categories: ['finance'],
    example: '/theblock/category/crypto-ecosystems',
    parameters: { category: 'News category' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['theblock.co/category/:category', 'theblock.co/news/:category'],
            target: '/category/:category',
        },
    ],
    description: 'Get latest news from TheBlock by category. Note that due to website limitations, only article summaries may be available.',
};
async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category');
    const limit = getRouteLimit(ctx, 10);
    const sourceCategory = category === 'crypto-ecosystems' ? 'ecosystems' : category;
    const apiUrl = `https://www.theblock.co/api/tbco/news-category/${sourceCategory}`;
    try {
        const response = await ofetch<{
            data: {
                articles: BlockArticle[];
                category: {
                    url: string;
                };
            };
        }>(apiUrl, { query: { size: 10 } });
        // Extract articles from the nested data structure
        const articles = response.data?.articles || [];
        if (!articles.length) {
            throw new Error(`No articles found for category: ${category}`);
        }
        const items = await pMap(articles.slice(0, limit), createArticleItem, { concurrency: 3, stopOnError: false });
        return {
            title: `TheBlock - ${category.charAt(0).toUpperCase() + category.slice(1).replaceAll('-', ' ')}`,
            link: response.data.category.url,
            item: items,
            description: `Latest articles from TheBlock in the ${category} category`,
            language: 'en',
        };
    } catch (error: any) {
        if (error instanceof AggregateError) {
            const message = `TheBlock article details failed: ${error.errors.map(String).join('; ')}`;
            logger.error(message);
            throw new AggregateError(error.errors, message, { cause: error });
        }
        logger.error(`Error in TheBlock handler: ${error.message}`);
        throw error;
    }
}
async function fetchArticleDetails(article: BlockArticle): Promise<BlockArticleDetails> {
    return await cache.tryGet(`theblock:article:v2:${article.url}`, async (): Promise<BlockArticleDetails> => {
        try {
            const articleResponse = await ofetch<{
                data: BlockPost;
            }>(`https://www.theblock.co/api/tbco/post/${article.id}`);
            const post = articleResponse.data;
            const $ = load(post.body ?? '', null, false);
            if (post.body || post.intro) {
                $('.copyright').remove();
                return {
                    description: (post.intro ?? '') + $.html(),
                    pubDate: post.published ? parseDate(post.published) : undefined,
                    updated: post.modified ? parseDate(post.modified) : undefined,
                    category: [...new Set([...post.categories.map((cat) => cat.name), ...post.tags.map((tag) => tag.name)])],
                    thumbnail: post.thumbnail,
                };
            }
            if (!article.subheading && !article.preview) {
                throw new NotFoundError(`Full article and source summary are unavailable for ${article.url}`);
            }
            logger.info(`Using the source summary for article: ${article.url}`);
        } catch (error: any) {
            if (!article.subheading && !article.preview) {
                throw error;
            }
            logger.warn(`Couldn't fetch full content for ${article.url}: ${error.message}`);
        }
        return {};
    });
}
async function createArticleItem(article: BlockArticle): Promise<DataItem> {
    const details = await fetchArticleDetails(article);
    if (!details.description) {
        return createSummaryItem(article);
    }
    return {
        title: article.title,
        link: article.url,
        pubDate: details.pubDate,
        updated: details.updated,
        description: (article.thumbnail && details.thumbnail ? `<p><img src="${details.thumbnail}" alt="${article.title}"></p>` : '') + details.description,
        author: article.authors?.map((a) => a.name).join(', ') || 'TheBlock',
        category: details.category,
        guid: article.url,
        image: article.thumbnail,
    };
}
// Helper function to create a summary-based item when full content isn't available
function createSummaryItem(article: BlockArticle): DataItem {
    let description = '';
    // Add thumbnail if available
    if (article.thumbnail) {
        description += `<p><img src="${article.thumbnail}" alt="${article.title}"></p>`;
    }
    // Add subheading if available
    if (article.subheading) {
        description += `<p><strong>${article.subheading}</strong></p>`;
    }
    // Add preview if available
    if (article.preview) {
        description += `<p>${article.preview}</p>`;
    }
    // Add link to original article
    description += `<p><a href="${article.url}">Read the full article at TheBlock</a></p>`;
    return {
        title: article.title,
        link: article.url,
        pubDate: article.published ? parseDate(article.published) : undefined,
        description,
        author: article.authors?.map((a) => a.name).join(', ') || 'TheBlock',
        category: article.primaryCategory?.name || [],
        guid: article.url,
        image: article.thumbnail,
    };
}
