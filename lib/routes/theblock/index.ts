import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

type BlockArticle = {
    id: number;
    title: string;
    url: string;
    thumbnail?: string;
    authors?: Array<{
        name: string;
    }>;
};
type BlockArticleDetails = Pick<DataItem, 'description' | 'pubDate' | 'updated' | 'category'> & {
    thumbnail: string;
};
type BlockPost = {
    body: string;
    intro: string;
    published: string;
    modified: string;
    thumbnail: string;
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
        const items = await pMap(articles.slice(0, limit), createArticleItem, { concurrency: 3 });
        return {
            title: `TheBlock - ${category.charAt(0).toUpperCase() + category.slice(1).replaceAll('-', ' ')}`,
            link: response.data.category.url,
            item: items,
            description: `Latest articles from TheBlock in the ${category} category`,
            language: 'en',
        };
    } catch (error: any) {
        logger.error(`Error in TheBlock handler: ${error.message}`);
        throw error;
    }
}
async function fetchArticleDetails(article: BlockArticle): Promise<BlockArticleDetails> {
    return await cache.tryGet(`theblock:article:v2:${article.url}`, async (): Promise<BlockArticleDetails> => {
        const articleResponse = await ofetch<{
            data: BlockPost;
        }>(`https://www.theblock.co/api/tbco/post/${article.id}`);
        const post = articleResponse.data;
        const $ = load(post.body, null, false);
        $('.copyright').remove();
        return {
            description: post.intro + $.html(),
            pubDate: parseDate(post.published),
            updated: parseDate(post.modified),
            category: [...new Set([...post.categories.map((cat) => cat.name), ...post.tags.map((tag) => tag.name)])],
            thumbnail: post.thumbnail,
        };
    });
}
async function createArticleItem(article: BlockArticle): Promise<DataItem> {
    const details = await fetchArticleDetails(article);
    return {
        title: article.title,
        link: article.url,
        pubDate: details.pubDate,
        updated: details.updated,
        description: `<p><img src="${details.thumbnail}" alt="${article.title}"></p>${details.description}`,
        author: article.authors?.map((a) => a.name).join(', ') || 'TheBlock',
        category: details.category,
        guid: article.url,
        image: article.thumbnail,
    };
}
