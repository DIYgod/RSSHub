import { Route, type Data } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import logger from '@/utils/logger';
import { Context } from 'hono';

type WordpressPost = {
    id: number;
    date: string;
    date_gmt?: string;
    link: string;
    title?: { rendered?: string };
    excerpt?: { rendered?: string };
    content?: { rendered?: string };
    _embedded?: {
        author?: Array<{ name?: string }>;
        'wp:term'?: Array<Array<{ name?: string }>>;
    };
};

const ROOT_URL = 'https://baselang.com';
const API_BASE = `${ROOT_URL}/wp-json/wp/v2`;

// Supported categories and their WP IDs
const CATEGORY_SLUG_TO_ID: Record<string, number> = {
    'advanced-grammar': 5,
    'basic-grammar': 4,
    company: 8,
    confidence: 9,
    french: 24,
    humor: 15,
    medellin: 23,
    motivation: 6,
    pronunciation: 11,
    'study-tips': 7,
    'success-stories': 14,
    travel: 13,
    uncategorized: 1,
    vocabulary: 12,
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_SLUG_TO_ID).map((slug) => ({ label: slug, value: slug }));

export const route: Route = {
    path: '/blog/:category?',
    categories: ['blog'],
    example: '/baselang/blog',
    parameters: {
        category: {
            description: 'Optional category filter',
            options: CATEGORY_OPTIONS,
        },
    },
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
            source: ['baselang.com/blog', 'baselang.com/blog/:category'],
            target: '/blog/:category',
        },
    ],
    name: 'Blog',
    maintainers: ['johan456789'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const categoryParam = (ctx.req.param('category') ?? '').toLowerCase();
    logger.debug(`BaseLang: received request, category='${categoryParam || 'all'}'`);

    if (categoryParam && !Object.hasOwn(CATEGORY_SLUG_TO_ID, categoryParam)) {
        logger.debug(`BaseLang: invalid category '${categoryParam}'`);
        throw new InvalidParameterError(`Invalid category: ${categoryParam}. Valid categories are: ${Object.keys(CATEGORY_SLUG_TO_ID).join(', ')}`);
    }

    const searchParams: string[] = ['per_page=20', '_embed=author,wp:term'];
    if (categoryParam) {
        const id = CATEGORY_SLUG_TO_ID[categoryParam];
        searchParams.push(`categories=${id}`);
    }

    const apiUrl = `${API_BASE}/posts?${searchParams.join('&')}`;

    const data = await ofetch<WordpressPost[]>(apiUrl);
    logger.debug(`BaseLang: fetched ${data.length} posts`);

    const items = data.map((post) => ({
        title: post.title?.rendered,
        description: post.content?.rendered ?? post.excerpt?.rendered ?? '',
        link: post.link,
        pubDate: parseDate(post.date_gmt ?? post.date),
        author: post._embedded?.author?.[0]?.name,
        category: Array.isArray(post._embedded?.['wp:term'])
            ? post._embedded['wp:term']
                  .flat()
                  .map((term: any) => term?.name)
                  .filter(Boolean)
            : undefined,
    }));

    const titleSuffix = categoryParam ? ` - ${categoryParam}` : '';
    const link = categoryParam ? `${ROOT_URL}/blog/${categoryParam}/` : `${ROOT_URL}/blog/`;

    return {
        title: `BaseLang Blog${titleSuffix}`,
        link,
        language: 'en',
        item: items,
    } as Data;
}
