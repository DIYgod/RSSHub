import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderArticleDescription } from './templates/description';
import { API_BASE_URL, type ArticleDetail, type ArticleListItem, type ArticleListResponse, CATEGORY_NAME_MAP, CATEGORY_OPTIONS, DEFAULT_LIMIT, DETAIL_CONCURRENCY, MAX_LIMIT, pickImageUrl, SITE_URL } from './utils';

const JSON_HEADERS = {
    Accept: 'application/json',
};

const formatTitle = (detail: ArticleDetail, listItem: ArticleListItem): string => {
    const baseTitle = detail.title || listItem.title;
    return detail.subtitle ? `${baseTitle} ${detail.subtitle}` : baseTitle;
};

const formatAuthors = (detail: ArticleDetail, listItem: ArticleListItem): string | undefined => {
    const names = [detail.aside?.author?.name?.trim(), detail.aside?.interviewer?.name?.trim(), listItem.author?.name?.trim()].filter((name): name is string => Boolean(name));
    const unique = [...new Set(names)];
    return unique.length > 0 ? unique.join(', ') : undefined;
};

const extractTags = (detail: ArticleDetail, listItem: ArticleListItem): string[] | undefined => {
    const rawTags = detail.aside?.tags ?? listItem.tags ?? [];
    const unique = [...new Set(rawTags.map((tag) => tag.name?.trim()).filter((name): name is string => Boolean(name)))];
    return unique.length > 0 ? unique : undefined;
};

const resolveCoverImage = (detail: ArticleDetail, listItem: ArticleListItem): string | undefined =>
    pickImageUrl(listItem.image) ?? pickImageUrl(listItem.preview) ?? pickImageUrl(detail.image) ?? pickImageUrl(detail.meta?.['og-og:image']?.content);

const resolvePubDate = (detail: ArticleDetail, listItem: ArticleListItem): Date | undefined => {
    const rawDate = detail.meta?.['article-article:published_time']?.content ?? detail.aside?.date ?? listItem.date;
    return rawDate ? parseDate(rawDate) : undefined;
};

const fetchArticleDetail = (listItem: ArticleListItem) =>
    cache.tryGet(`80lv:article:${listItem.slug}`, async () => {
        const link = `${SITE_URL}/articles/${listItem.slug}`;
        const detail = await ofetch<ArticleDetail>(`${API_BASE_URL}/${encodeURIComponent(listItem.slug)}`, {
            headers: JSON_HEADERS,
        });

        const dataItem: DataItem = {
            title: formatTitle(detail, listItem),
            link,
            description: renderArticleDescription(detail, listItem),
            pubDate: resolvePubDate(detail, listItem),
            author: formatAuthors(detail, listItem),
            category: extractTags(detail, listItem),
            image: resolveCoverImage(detail, listItem),
        };

        return dataItem;
    });

const resolveCategoryLabel = (categorySlug: string | undefined, items: ArticleListItem[]): string => {
    if (!categorySlug || categorySlug === 'all') {
        return 'Articles';
    }
    const known = CATEGORY_NAME_MAP.get(categorySlug);
    if (known) {
        return known;
    }
    for (const item of items) {
        const matched = item.tags?.find((tag) => tag.slug === categorySlug && tag.name);
        if (matched?.name) {
            return matched.name;
        }
    }
    return categorySlug;
};

const buildListQuery = (limit: number, category?: string) => {
    if (category === '80-level-china') {
        return { page: 1, total: limit, is_chinese: 1 };
    }
    if (category && category !== 'all') {
        return { page: 1, total: limit, category };
    }
    return { page: 1, total: limit };
};

async function handler(ctx: Context): Promise<Data> {
    const rawCategory = ctx.req.param('category');
    const category = rawCategory && rawCategory !== 'all' ? rawCategory : undefined;
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);

    const listRes = await ofetch<ArticleListResponse>(`${API_BASE_URL}/list`, {
        headers: JSON_HEADERS,
        query: buildListQuery(limit, category),
    });

    const seenSlugs = new Set<string>();
    const targetItems: ArticleListItem[] = [];
    const listItems = listRes.items ?? [];
    for (const item of listItems) {
        if (!item.slug || seenSlugs.has(item.slug)) {
            continue;
        }
        seenSlugs.add(item.slug);
        targetItems.push(item);
        if (targetItems.length >= limit) {
            break;
        }
    }

    const items = await pMap(targetItems, (listItem) => fetchArticleDetail(listItem), {
        concurrency: DETAIL_CONCURRENCY,
    });

    const categoryLabel = resolveCategoryLabel(category, targetItems);

    return {
        title: `80 Level - ${categoryLabel}`,
        link: category ? `${SITE_URL}/articles/${category}` : `${SITE_URL}/articles`,
        language: category === '80-level-china' ? 'zh-CN' : 'en',
        item: items as DataItem[],
    };
}

export const route: Route = {
    path: '/articles/:category?',
    name: 'Articles',
    url: '80.lv/articles',
    example: '/80lv/articles',
    categories: ['game'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    parameters: {
        category: {
            description: 'Category slug from `https://80.lv/articles/:category` (`all` or omitted for all articles; supports `news`, `interview`, `game-development`, `environment-art`, `tech`, `vfx`, `80-level-china`, etc.).',
            default: 'all',
            options: CATEGORY_OPTIONS.map((item) => ({ value: item.slug, label: item.name })),
        },
    },
    description: 'Full-text articles from 80 Level covering game development, environment/character art, VFX, tech, and developer interviews. Fetches 20 entries by default; supports the common `limit` query parameter (1-100).',
    zh: {
        name: '文章',
        parameters: {
            category: {
                description: '分类标识（对应 `https://80.lv/articles/:category`，默认 `all` 或留空为全部文章；支持 `news`、`interview`、`game-development`、`environment-art`、`tech`、`vfx`、`80-level-china` 等）。',
                default: 'all',
                options: CATEGORY_OPTIONS.map((item) => ({ value: item.slug, label: item.name })),
            },
        },
        description: '获取 80 Level 官方文章全文（涵盖游戏开发、环境与角色美术、VFX、图形技术及开发者专访）。默认获取 20 篇，支持通用 `limit` 参数（1-100）。',
    },
    radar: [
        {
            source: ['80.lv/', '80.lv/articles'],
            target: '/articles',
        },
        ...CATEGORY_OPTIONS.filter((item) => item.slug !== 'all').map((item) => ({
            source: [`80.lv/articles/${item.slug}`],
            target: `/articles/${item.slug}`,
        })),
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    handler,
};
