import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface QwenApiResponse {
    data?: {
        articles?: Array<{
            id: string;
            title: string;
            path: string;
            content: string;
            language: string;
            extra?: {
                author?: string;
                cover_small?: string;
                date?: string;
                introduction?: string;
                tags?: string[];
            };
        }>;
    };
}

const endpoint = 'https://qwen.ai/api/v2/article/retrieval';
const baseUrl = 'https://qwen.ai';

export async function fetchQwenArticles(language = 'en-US'): Promise<DataItem[]> {
    const response = await ofetch<QwenApiResponse>(endpoint, {
        query: {
            type: 'qwen_ai',
            language,
        },
        headers: {
            'User-Agent': config.ua,
            'X-Request-Id': 'rsshub-qwen',
        },
    });

    return (response.data?.articles ?? []).map((article) => {
        const $ = load(article.content);
        const description = $('.post-content').html() ?? $('article').html() ?? undefined;
        const canonical = $('link[rel="canonical"]').attr('href');

        return {
            title: article.title,
            link: canonical || new URL(article.path, baseUrl).href,
            description,
            pubDate: article.extra?.date ? parseDate(article.extra.date) : undefined,
            author: article.extra?.author,
            category: article.extra?.tags,
            image: article.extra?.cover_small,
            guid: article.id,
        } satisfies DataItem;
    });
}
