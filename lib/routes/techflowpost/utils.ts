import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { getAcwScV2ByArg1 } from '../5eplay/utils';

const rootUrl = 'https://www.techflowpost.com';
const apiRootUrl = `${rootUrl}/api`;
const uploadRootUrl = 'https://upload.techflowpost.com';
const locale = 'zh-CN';

let acwScV2Cookie = '';

type ApiListResponse<T> = {
    data?: T[];
};

type Label = {
    label?: string;
};

type Article = {
    id: number;
    title: string;
    abstract?: string;
    picture?: string;
    author?: {
        name?: string;
    };
    category?: {
        name?: string;
    };
    labels?: Label[];
    created_at?: string;
    updated_at?: string;
};

type ArticleDetailResponse = {
    article?: {
        content?: string;
    };
};

type Newsflash = {
    id: number;
    title: string;
    abstract?: string;
    url?: string;
    created_at?: string;
    updated_at?: string;
};

type NewsflashDetailResponse = {
    content?: string;
};

function getHeaders(referer: string, cookie = acwScV2Cookie) {
    return {
        accept: 'application/json, text/plain, */*',
        'accept-language': locale,
        referer,
        'user-agent': config.trueUA,
        ...(cookie ? { cookie } : {}),
    };
}

function getAcwScV2Cookie(response: string) {
    const arg1 = response.match(/var arg1='(.*?)';/)?.[1];
    if (!arg1) {
        return '';
    }
    return `acw_sc__v2=${getAcwScV2ByArg1(arg1)}`;
}

async function requestApi<T>(endpoint: string, referer: string, searchParams?: Record<string, string | number | boolean>) {
    const request = () =>
        got.get(`${apiRootUrl}${endpoint}`, {
            searchParams,
            headers: getHeaders(referer),
        });

    const { data } = await request();
    if (typeof data !== 'string') {
        return data as T;
    }

    const cookie = getAcwScV2Cookie(data);
    if (!cookie) {
        throw new Error('TechFlow API returned an unexpected non-JSON response.');
    }

    acwScV2Cookie = cookie;
    const retryResponse = await request();
    if (typeof retryResponse.data === 'string') {
        throw new TypeError('TechFlow API still returned an anti-crawler challenge after retry.');
    }

    return retryResponse.data as T;
}

function getPictureUrl(picture?: string) {
    if (!picture) {
        return;
    }
    return new URL(picture, uploadRootUrl).href;
}

function getCategories(article: Article) {
    return [...new Set([article.category?.name, ...(article.labels?.map((label) => label.label) ?? [])].filter(Boolean))] as string[];
}

function getArticleItem(article: Article, content?: string): DataItem {
    const link = `${rootUrl}/${locale}/article/${article.id}`;
    const categories = getCategories(article);
    const image = getPictureUrl(article.picture);

    return {
        title: article.title,
        author: article.author?.name,
        link,
        category: categories.length ? categories : undefined,
        pubDate: article.created_at ? parseDate(article.created_at) : undefined,
        updated: article.updated_at ? parseDate(article.updated_at) : undefined,
        description: content || article.abstract,
        image,
    };
}

function getNewsflashItem(newsflash: Newsflash, content?: string): DataItem {
    return {
        title: newsflash.title,
        link: `${rootUrl}/${locale}/newsletter/${newsflash.id}`,
        pubDate: newsflash.created_at ? parseDate(newsflash.created_at) : undefined,
        updated: newsflash.updated_at ? parseDate(newsflash.updated_at) : undefined,
        description: content || newsflash.abstract,
    };
}

async function getArticleItems({ category, limit }: { category?: string; limit: string | number }) {
    const link = `${rootUrl}/${locale}/article`;
    const searchParams: Record<string, string | number> = {
        page: 1,
        page_size: limit,
    };

    if (category) {
        searchParams.category_id = category;
    }

    const response = await requestApi<ApiListResponse<Article>>('/client/articles', link, searchParams);
    if (!Array.isArray(response.data)) {
        throw new TypeError('TechFlow API returned an invalid article list.');
    }

    return await Promise.all(
        response.data.map((article) =>
            cache.tryGet(`techflowpost:article:${article.id}`, async () => {
                const itemLink = `${rootUrl}/${locale}/article/${article.id}`;
                const detail = await requestApi<ArticleDetailResponse>(`/client/articles/${article.id}`, itemLink);

                return getArticleItem(article, detail.article?.content);
            })
        )
    );
}

async function getNewsflashItems(limit: string | number) {
    const link = `${rootUrl}/${locale}/newsletter`;
    const response = await requestApi<ApiListResponse<Newsflash>>('/client/newsflashes', link, {
        page: 1,
        page_size: limit,
    });

    if (!Array.isArray(response.data)) {
        throw new TypeError('TechFlow API returned an invalid newsflash list.');
    }

    return await Promise.all(
        response.data.map((newsflash) =>
            cache.tryGet(`techflowpost:newsflash:${newsflash.id}`, async () => {
                const itemLink = `${rootUrl}/${locale}/newsletter/${newsflash.id}`;
                const detail = await requestApi<NewsflashDetailResponse>(`/client/newsflashes/${newsflash.id}`, itemLink);

                return getNewsflashItem(newsflash, detail.content);
            })
        )
    );
}

export { getArticleItems, getNewsflashItems, rootUrl };
