import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export async function getArticle(item: DataItem): Promise<DataItem | undefined> {
    if (!item.link) {
        return item;
    }
    let detail: { description: string; datePublished?: string; author?: string };
    try {
        detail = await cache.tryGet(`cool18:article:${item.link}`, async () => {
            const response = await ofetch(item.link!);
            const $ = load(response);
            const metadata = JSON.parse($('script[type="application/ld+json"]').first().text() || '{}');
            return {
                description: $('pre').html()?.replaceAll('<font color="#E6E6DD">cool18.com</font>', '') || '',
                datePublished: typeof metadata.datePublished === 'string' ? metadata.datePublished : undefined,
                author: typeof metadata.author?.name === 'string' ? metadata.author.name : undefined,
            };
        });
    } catch (error) {
        if (error instanceof FetchError && error.statusCode === 404) {
            return;
        }
        throw error;
    }
    const pubDate = detail.datePublished ? parseDate(detail.datePublished) : undefined;
    return {
        ...item,
        description: detail.description,
        author: item.author || detail.author,
        pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : item.pubDate,
    };
}
